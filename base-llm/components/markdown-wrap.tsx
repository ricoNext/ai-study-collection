import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify)

const MarkdownWrap = ({ children }: { children: string }) => {
    const html = processor.processSync(children).toString()
    return (
        <div dangerouslySetInnerHTML={{ __html: html }} />
    )
}

export default MarkdownWrap