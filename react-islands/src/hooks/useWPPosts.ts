import { useQuery } from '@tanstack/react-query'

export type WPPost = {
  id: number
  date: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
}

const WP_API =
  (document.querySelector<HTMLMetaElement>('meta[name="wp-api-root"]')?.content
    ?? window.location.origin) + '/wp-json/wp/v2'

async function fetchPosts(count: number): Promise<WPPost[]> {
  const url = `${WP_API}/posts?per_page=${count}&_fields=id,title,date,link,excerpt`
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) throw new Error(`WP REST ${res.status}`)
  return res.json()
}

export function useWPPosts(count = 3) {
  return useQuery<WPPost[]>({
    queryKey: ['wp-posts', count],
    queryFn: () => fetchPosts(count),
  })
}
