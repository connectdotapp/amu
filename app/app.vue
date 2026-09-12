<script setup lang="ts">
const site = useSiteConfig()

useSeoMeta({
  titleTemplate: `%s · ${site.name}`,
  ogSiteName: site.name,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})

useSchemaOrg([
  defineWebSite({ name: site.name, description: site.description }),
  defineOrganization({ name: site.name })
])
</script>

<template>
  <UApp>
    <TheHeader />
    <UMain>
      <NuxtPage />
    </UMain>
    <TheFooter />
  </UApp>
</template>
