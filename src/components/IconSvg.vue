<template>
  <svg
    class="icon-svg"
    :class="[`icon-${name}`, sizeClass, { 'icon-spin': spin }]"
    :style="iconStyle"
    aria-hidden="true"
  >
    <use :xlink:href="`#icon-${name}`" />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 20
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  spin: {
    type: Boolean,
    default: false
  }
});

const sizeClass = computed(() => {
  if (typeof props.size === 'string') {
    return `icon-size-${props.size}`;
  }
  return '';
});

const iconStyle = computed(() => {
  const style = {
    color: props.color
  };
  if (typeof props.size === 'number') {
    style.width = `${props.size}px`;
    style.height = `${props.size}px`;
  }
  return style;
});
</script>

<style scoped>
.icon-svg {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.icon-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 预设尺寸 */
.icon-size-xs { width: 12px; height: 12px; }
.icon-size-sm { width: 16px; height: 16px; }
.icon-size-md { width: 20px; height: 20px; }
.icon-size-lg { width: 24px; height: 24px; }
.icon-size-xl { width: 32px; height: 32px; }
.icon-size-2xl { width: 48px; height: 48px; }
</style>
