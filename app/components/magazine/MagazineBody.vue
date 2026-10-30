<script setup lang="ts">
const props = defineProps<{ source: string }>()
const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <!-- renderMarkdown 이 raw HTML 과 위험 스킴을 제거하므로 v-html 사용 -->
  <div
    class="amu-prose"
    v-html="html"
  />
</template>

<style>
.amu-prose {
  font-size: 17px;
  line-height: 1.8;
  color: var(--color-neutral-700);
  word-break: keep-all;
  overflow-wrap: anywhere;
}
@media (max-width: 767px) {
  .amu-prose { font-size: 16px; }
}
.amu-prose > * + * { margin-top: 1.25em; }
.amu-prose h2 {
  margin-top: 2.6em;
  padding-top: 1em;
  border-top: 1px solid var(--color-neutral-150);
  font-size: 1.55em;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.03em;
  color: var(--color-neutral-950);
}
.amu-prose h3 {
  margin-top: 2em;
  font-size: 1.18em;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-neutral-950);
}
.amu-prose h2 + *, .amu-prose h3 + * { margin-top: 0.7em; }
.amu-prose strong { font-weight: 700; color: var(--color-neutral-950); }
.amu-prose em { font-style: normal; font-weight: 700; color: var(--color-neutral-950); box-shadow: inset 0 -0.4em 0 var(--color-neutral-150); }
.amu-prose a { color: var(--color-neutral-950); text-decoration: underline; text-underline-offset: 3px; }
.amu-prose ul, .amu-prose ol { padding-left: 1.4em; }
.amu-prose ul { list-style: disc; }
.amu-prose ol { list-style: decimal; }
.amu-prose li + li { margin-top: 0.45em; }
.amu-prose li::marker { color: var(--color-neutral-400); }
.amu-prose blockquote {
  margin: 2em 0;
  padding: 1.3em 1.5em;
  border-left: 3px solid var(--color-neutral-950);
  background: var(--color-neutral-100);
  border-radius: 0 16px 16px 0;
  font-size: 1.12em;
  font-weight: 700;
  line-height: 1.55;
  letter-spacing: -0.02em;
  color: var(--color-neutral-950);
}
.amu-prose blockquote > * + * { margin-top: 0.6em; }
.amu-prose code {
  padding: 0.15em 0.4em;
  border-radius: 6px;
  background: var(--color-neutral-100);
  font-size: 0.88em;
}
.amu-prose pre {
  overflow-x: auto;
  padding: 1.2em 1.4em;
  border-radius: 14px;
  background: var(--color-neutral-950);
  color: #E5E5E5;
  font-size: 13.5px;
  line-height: 1.7;
}
.amu-prose pre code { padding: 0; background: none; font-size: inherit; color: inherit; }
.amu-prose img { width: 100%; height: auto; border-radius: 16px; margin: 2em 0; }
.amu-prose hr { margin: 2.6em 0; border: 0; border-top: 1px solid var(--color-neutral-150); }
.amu-prose table { width: 100%; border-collapse: collapse; font-size: 0.92em; }
.amu-prose th, .amu-prose td { padding: 0.6em 0.8em; border-bottom: 1px solid var(--color-neutral-150); text-align: left; }
.amu-prose th { font-weight: 700; color: var(--color-neutral-950); }
</style>
