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
                <Label for="text-input">Text to analyze</Label>
                <Textarea
                    id="text-input"
                    v-model="inputText"
                    placeholder="Enter some text to analyze its sentiment"
                    :disabled="isLoading"
                />
            </div>

            <Badge v-if="isLoading" variant="outline" class="mt-4">
                <Spinner />
                Loading sentiment analysis model
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
                        <span>{{ (sentiment.score * 100).toFixed(1) }}%</span>
                    </div>
                    <Progress :model-value="sentiment.score * 100" />
                </div>
            </div>
        </CardContent>
    </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Separator from '@/components/ui/separator/Separator.vue';
import { useSentimentAnalysis } from '@/composables/useSentimentAnalysis';

const inputText = ref(
    "Today we're launching AgentKit, a complete set of tools for developers and enterprises to build, deploy, and optimize agents.",
);

const { sentiment, isLoading, error, analyze } = useSentimentAnalysis({
    dtype: 'fp16',
});

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

watchDebounced(inputText, analyze, {
    debounce: 300,
    maxWait: 1000,
    immediate: true,
});
</script>
