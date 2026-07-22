import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vendorsService } from '../services/vendors.service'
import { queryKeys, invalidateSubtree } from '../services/queryKeys'
import type { VendorProduct } from '../types'

interface CreateProductParams {
  name: string
  price: number
  category?: string
  description?: string
}

interface UpdateProductParams {
  id: string
  data: {
    name?: string
    price?: number
    category?: string
    description?: string
  }
}

export function useAddProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: CreateProductParams) => vendorsService.createProduct(params),
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.products() })

      const previousProducts = queryClient.getQueryData<VendorProduct[]>(
        queryKeys.vendors.products()
      )

      if (previousProducts) {
        const optimisticItem: VendorProduct = {
          id: `temp-${Date.now()}`,
          name: newProduct.name,
          price: newProduct.price,
          description: newProduct.description,
          active: true,
          createdAt: new Date().toISOString(),
        }
        queryClient.setQueryData<VendorProduct[]>(queryKeys.vendors.products(), [
          ...previousProducts,
          optimisticItem,
        ])
      }

      return { previousProducts }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.vendors.products(), context.previousProducts)
      }
    },
    onSettled: () => {
      invalidateSubtree.vendorProducts(queryClient)
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductParams) =>
      vendorsService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.products() })

      const previousProducts = queryClient.getQueryData<VendorProduct[]>(
        queryKeys.vendors.products()
      )

      if (previousProducts) {
        queryClient.setQueryData<VendorProduct[]>(
          queryKeys.vendors.products(),
          previousProducts.map((p) => (p.id === id ? { ...p, ...data } : p))
        )
      }

      return { previousProducts }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.vendors.products(), context.previousProducts)
      }
    },
    onSettled: () => {
      invalidateSubtree.vendorProducts(queryClient)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vendorsService.deleteProduct(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.products() })

      const previousProducts = queryClient.getQueryData<VendorProduct[]>(
        queryKeys.vendors.products()
      )

      if (previousProducts) {
        queryClient.setQueryData<VendorProduct[]>(
          queryKeys.vendors.products(),
          previousProducts.filter((p) => p.id !== id)
        )
      }

      return { previousProducts }
    },
    onError: (_err, _id, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(queryKeys.vendors.products(), context.previousProducts)
      }
    },
    onSettled: () => {
      invalidateSubtree.vendorProducts(queryClient)
    },
  })
}
