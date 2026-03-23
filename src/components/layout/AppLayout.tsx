import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AddProductModal } from '@/components/AddProductModal'
import { AttachmentModal } from '@/components/AttachmentModal'
import type { AttachmentFile } from '@/components/AttachmentModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWarranty } from '@/lib/data-provider'
import type { CreateWarrantyInput } from '@/types'

export function AppLayout() {
  const [modalOpen, setModalOpen] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [initialProductName, setInitialProductName] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentFile[]>([])
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: createWarranty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warranties'] }),
  })

  function handleAddProduct(input: CreateWarrantyInput) {
    // Attach the first image as the product image
    const imageFile = pendingAttachments.find((f) => f.type === 'image')
    const inputWithImage = imageFile ? { ...input, image_url: imageFile.dataUrl } : input
    addMutation.mutate(inputWithImage)
    setPendingAttachments([])
  }

  function openModal(productName?: string) {
    setInitialProductName(productName ?? '')
    setModalOpen(true)
  }

  function handleModalClose(open: boolean) {
    setModalOpen(open)
    if (!open) setPendingAttachments([])
  }

  return (
    <div className="h-screen bg-page flex overflow-hidden">
      <Sidebar onNewProduct={() => openModal()} />
      <main className="flex-1 min-w-0 py-[120px] flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-[1104px] px-[40px]">
          <Outlet context={{
            onNewProduct: () => openModal(),
            onNewProductWithName: (name: string) => openModal(name),
            onOpenAttachment: () => setAttachmentOpen(true),
          }} />
        </div>
      </main>
      <AddProductModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleAddProduct}
        initialProductName={initialProductName}
        attachments={pendingAttachments}
        onOpenAttachment={() => setAttachmentOpen(true)}
      />
      <AttachmentModal
        open={attachmentOpen}
        onOpenChange={setAttachmentOpen}
        onAttach={setPendingAttachments}
        existingFiles={pendingAttachments}
      />
    </div>
  )
}
