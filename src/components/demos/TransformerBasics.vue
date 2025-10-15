<template>
    <Card>
        <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
            <a
                href="https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english"
                class="text-muted-foreground mt-2 text-xs hover:underline"
            >
                <code>
                    Xenova/distilbert-base-uncased-finetuned-sst-2-english
                </code>
            </a>
        </CardHeader>

        <CardContent>
            <div class="space-y-2">
                <Label for="text-input"> Text to analyze </Label>
                <Textarea
                    id="text-input"
                    v-model="inputText"
                    placeholder="Enter some text to analyze its sentiment"
                />
            </div>

            <Badge v-if="loadingMessage" variant="outline" class="mt-4">
                <Spinner />
                {{ loadingMessage }}
            </Badge>

            <Alert v-if="error" variant="destructive" class="mt-4">
                <AlertDescription>
                    {{ error }}
                </AlertDescription>
            </Alert>

            <div v-if="sentiment" class="space-y-3">
                <Separator class="my-8" />

                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Sentiment:</span>
                    <Badge :variant="getSentimentBadgeVariant(sentiment.label)">
                        {{ sentiment.label }}
                    </Badge>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-sm">
                        <span class="font-medium">Confidence:</span>
                        <span> {{ (sentiment.score * 100).toFixed(1) }}% </span>
                    </div>
                    <Progress :model-value="sentiment.score * 100" />
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { pipeline } from '@huggingface/transformers';
import type {
    TextClassificationPipeline,
    TextClassificationSingle,
} from '@huggingface/transformers';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Separator from '@/components/ui/separator/Separator.vue';
import { watchDebounced } from '@vueuse/core';

const inputText = ref(
    "Today we're launching AgentKit, a complete set of tools for developers and enterprises to build, deploy, and optimize agents.",
);
const sentiment = ref<TextClassificationSingle>();
const loadingMessage = ref<string | undefined>(
    'Loading sentiment analysis model',
);
const error = ref('');

let classifier: TextClassificationPipeline | undefined;

async function analyzeSentiment() {
    await initPipeline();

    if (!inputText.value.trim() || !classifier) {
        return;
    }

    error.value = '';
    sentiment.value = undefined;

    try {
        const output = await classifier(inputText.value);
        sentiment.value = Array.isArray(output[0]) ? output[0][0] : output[0];
    } catch (err) {
        error.value = 'Failed to analyze sentiment.';
        console.error(err);
    } finally {
        loadingMessage.value = undefined;
    }
}

async function initPipeline() {
    if (classifier) {
        return;
    }

    try {
        // Precision hierarchy (highest -> lowest):
        // fp32: full precision (best accuracy, slowest, largest)
        // fp16: half precision (slightly lower accuracy, faster, smaller)
        // q8/int8/uint8: 8-bit quantization (good balance, smaller size)
        // q4/bnb4/q4f16: 4-bit quantization (tiny & fast, biggest accuracy loss)

        classifier = (await pipeline(
            'sentiment-analysis',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            { dtype: 'fp16' },
        )) as unknown as TextClassificationPipeline;
    } catch (err) {
        error.value = 'Failed to load the sentiment analysis model.';
        console.error(err);
    }
     finally {
        loadingMessage.value = undefined;
    }
}

function getSentimentBadgeVariant(label: string) {
    switch (label.toLowerCase()) {
        case 'positive':
            return 'success';
        case 'negative':
            return 'destructive';
        default:
            return 'secondary';
    }
}

watchDebounced(inputText, analyzeSentiment, {
    debounce: 300,
    maxWait: 1000,
    immediate: true,
});

onUnmounted(() => {
  classifier?.dispose();
});
</script>
