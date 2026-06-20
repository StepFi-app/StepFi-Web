import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Components } from 'react-markdown'

const COPY_STYLES: Components = {
  code({ className, children, ...props }) {
    const isInline = !className
    if (isInline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-elevated text-brand font-mono text-sm" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
  pre({ children }) {
    return (
      <pre className="overflow-x-auto rounded-xl border border-border bg-surface/80 p-4 text-sm leading-relaxed">
        {children}
      </pre>
    )
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return (
      <th className="text-left py-3 px-4 text-text-muted font-medium border-b border-border bg-elevated/50">
        {children}
      </th>
    )
  },
  td({ children }) {
    return (
      <td className="py-3 px-4 text-text-secondary border-b border-border/50">{children}</td>
    )
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand underline underline-offset-2 decoration-brand/60 hover:decoration-brand"
      >
        {children}
      </a>
    )
  },
  h1({ children }) {
    return <h1 className="font-display font-bold text-3xl text-text-primary mb-6 mt-0">{children}</h1>
  },
  h2({ children }) {
    return <h2 className="font-display font-bold text-xl text-text-primary mb-4 mt-10 pb-2 border-b border-border">{children}</h2>
  },
  h3({ children }) {
    return <h3 className="font-display font-semibold text-lg text-text-primary mb-3 mt-8">{children}</h3>
  },
  p({ children }) {
    return <p className="text-text-secondary leading-relaxed mb-4">{children}</p>
  },
  ul({ children }) {
    return <ul className="space-y-2 mb-4 ml-5 list-disc text-text-secondary">{children}</ul>
  },
  ol({ children }) {
    return <ol className="space-y-2 mb-4 ml-5 list-decimal text-text-secondary">{children}</ol>
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-brand/40 pl-4 py-2 my-4 rounded-r-xl bg-brand/5 text-text-secondary">
        {children}
      </blockquote>
    )
  },
  hr() {
    return <hr className="border-border my-8" />
  },
}

interface DocContentProps {
  content: string
}

export function DocContent({ content }: DocContentProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={COPY_STYLES}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
