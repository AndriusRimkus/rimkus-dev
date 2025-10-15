<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();
</script>

<template>
    <div
        data-slot="card"
        :class="
            cn(
                'bg-card/50 border-border/50 flex flex-col gap-4 rounded-2xl border py-6 shadow-lg shadow-black/5 backdrop-blur-sm dark:shadow-black/10',
                props.class,
            )
        "
    >
        <slot />
    </div>
</template>
