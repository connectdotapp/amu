<script setup lang="ts">
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore'
import type { Category } from '~/types/user'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '카테고리 관리',
  robots: 'noindex, nofollow'
})

const db = useFirestore()
const toast = useToast()

const categories = ref<Category[]>([])
const loading = ref(false)

async function refresh() {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'categories'), orderBy('order')))
    categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Category)
  } catch (e: any) {
    toast.add({ title: '불러오기 실패', description: e?.message, color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

// Add form
const newCat = reactive({ name: '', slug: '', order: 0 })
const adding = ref(false)

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

watch(() => newCat.name, (v) => {
  if (!newCat.slug || slugify(newCat.slug) === newCat.slug) {
    newCat.slug = slugify(v)
  }
})

async function addCategory() {
  const slug = newCat.slug.trim()
  const name = newCat.name.trim()
  if (!slug || !name) {
    toast.add({ title: '이름과 슬러그를 입력해 주세요.', color: 'warning' })
    return
  }
  adding.value = true
  try {
    await setDoc(doc(db, 'categories', slug), {
      slug,
      name,
      order: Number(newCat.order) || (categories.value.length + 1)
    })
    toast.add({ title: '추가됐어요', color: 'success' })
    newCat.name = ''
    newCat.slug = ''
    newCat.order = 0
    await refresh()
  } catch (e: any) {
    toast.add({ title: '추가 실패', description: e?.message, color: 'error' })
  } finally {
    adding.value = false
  }
}

// Edit
const editingId = ref<string | null>(null)
const editDraft = reactive({ name: '', order: 0 })
const saving = ref(false)

function startEdit(c: Category) {
  editingId.value = c.id
  editDraft.name = c.name
  editDraft.order = c.order
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(c: Category) {
  if (!editDraft.name.trim()) return
  saving.value = true
  try {
    await setDoc(doc(db, 'categories', c.slug), {
      slug: c.slug,
      name: editDraft.name.trim(),
      order: Number(editDraft.order) || 0
    }, { merge: true })
    toast.add({ title: '저장됨', color: 'success' })
    editingId.value = null
    await refresh()
  } catch (e: any) {
    toast.add({ title: '저장 실패', description: e?.message, color: 'error' })
  } finally {
    saving.value = false
  }
}

async function remove(c: Category) {
  if (!confirm(`"${c.name}" 카테고리를 삭제할까요?\n이 카테고리로 지정된 프로덕트가 있으면 필터가 깨질 수 있어요.`)) return
  try {
    await deleteDoc(doc(db, 'categories', c.slug))
    toast.add({ title: '삭제됨', color: 'success' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: '삭제 실패', description: e?.message, color: 'error' })
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-10">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      관리자
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tighter sm:text-4xl">카테고리 관리</h1>
    <p class="mt-2 text-neutral-500">홈의 카테고리 컬럼에 노출돼요. 순서 값이 작을수록 위로.</p>

    <!-- Add form -->
    <section class="mt-10 rounded-3xl bg-neutral-150 p-6 dark:bg-neutral-800">
      <h2 class="text-sm font-semibold text-neutral-500">새 카테고리</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]">
        <UFormField label="이름">
          <UInput v-model="newCat.name" placeholder="예: 게임" />
        </UFormField>
        <UFormField label="슬러그">
          <UInput v-model="newCat.slug" placeholder="game" />
        </UFormField>
        <UFormField label="순서">
          <UInput v-model.number="newCat.order" type="number" placeholder="8" />
        </UFormField>
        <div class="flex items-end">
          <UButton color="neutral" variant="solid" :loading="adding" icon="i-lucide-plus" @click="addCategory">
            추가
          </UButton>
        </div>
      </div>
    </section>

    <!-- List -->
    <section class="mt-6 space-y-3">
      <article
        v-for="c in categories"
        :key="c.id"
        class="flex flex-col gap-3 rounded-3xl bg-neutral-150 p-5 sm:flex-row sm:items-center dark:bg-neutral-800"
      >
        <template v-if="editingId === c.id">
          <div class="flex-1 grid gap-3 sm:grid-cols-[1fr_120px]">
            <UInput v-model="editDraft.name" placeholder="이름" />
            <UInput v-model.number="editDraft.order" type="number" placeholder="순서" />
          </div>
          <div class="flex gap-2">
            <UButton size="sm" color="neutral" variant="solid" :loading="saving" @click="saveEdit(c)">
              저장
            </UButton>
            <UButton size="sm" color="neutral" variant="ghost" @click="cancelEdit">
              취소
            </UButton>
          </div>
        </template>

        <template v-else>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-xs text-neutral-400 tabular-nums">#{{ c.order }}</span>
              <span class="font-bold tracking-tight">{{ c.name }}</span>
            </div>
            <div class="mt-1 text-xs text-neutral-500">slug: {{ c.slug }}</div>
          </div>
          <div class="flex gap-2">
            <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-pencil" @click="startEdit(c)">
              수정
            </UButton>
            <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-trash-2" @click="remove(c)">
              삭제
            </UButton>
          </div>
        </template>
      </article>

      <div v-if="!loading && !categories.length" class="rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
        <p class="text-neutral-500">카테고리가 없어요. 위에서 추가해 보세요.</p>
      </div>
    </section>
  </div>
</template>
