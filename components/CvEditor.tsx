"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

// 1. Define the props to accept dynamic content
export default function CvEditor({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: content, 
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none w-[210mm] min-h-[297mm] bg-white shadow-lg p-10 mx-auto print:shadow-none print:p-0 print:m-0',
      },
    },
  })

  // 2. Listen for new AI content and update the editor
  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  return (
    <div className="w-full pb-10">
      <EditorContent editor={editor} />
    </div>
  )
}