import { ref, onUnmounted } from 'vue';
import { pipeline } from '@huggingface/transformers';
import type {
    TextClassificationPipeline,
    TextClassificationSingle,
} from '@huggingface/transformers';

export interface UseSentimentAnalysisOptions {
    modelName?: string;
    dtype?: 'fp32' | 'fp16' | 'q8' | 'int8' | 'uint8' | 'q4' | 'bnb4' | 'q4f16';
    autoInit?: boolean;
}

export function useSentimentAnalysis(
    options: UseSentimentAnalysisOptions = {},
) {
    const {
        modelName = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        dtype = 'fp16',
        autoInit = true,
    } = options;

    const sentiment = ref<TextClassificationSingle>();
    const isLoading = ref(autoInit);
    const isAnalyzing = ref(false);
    const error = ref('');

    let classifier: TextClassificationPipeline | undefined;

    async function initPipeline() {
        if (classifier) {
            return;
        }

        isLoading.value = true;
        error.value = '';

        try {
            const pipe = await pipeline('sentiment-analysis', modelName, {
                dtype,
            });
            classifier = pipe; // solves ts(2590)
        } catch (err) {
            error.value = 'Failed to load the sentiment analysis model.';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function analyze(text: string) {
        await initPipeline();

        if (!text.trim() || !classifier) {
            sentiment.value = undefined;
            return;
        }

        isAnalyzing.value = true;
        error.value = '';

        try {
            const output = await classifier(text);
            sentiment.value = Array.isArray(output[0])
                ? output[0][0]
                : output[0];
        } catch (err) {
            error.value = 'Failed to analyze sentiment.';
            throw err;
        } finally {
            isAnalyzing.value = false;
        }
    }

    function reset() {
        sentiment.value = undefined;
        error.value = '';
        isAnalyzing.value = false;
    }

    function dispose() {
        classifier?.dispose();
        classifier = undefined;
    }

    if (autoInit) {
        initPipeline();
    }

    onUnmounted(() => {
        dispose();
    });

    return {
        sentiment,
        isLoading,
        isAnalyzing,
        error,

        initPipeline,
        analyze,
        reset,
        dispose,
    };
}
