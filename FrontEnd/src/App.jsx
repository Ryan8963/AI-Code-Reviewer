import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import * as EditorModule from "react-simple-code-editor"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import prism from "prismjs"
import axios from 'axios'
import "prismjs/components/prism-clike"
import "prismjs/components/prism-csharp"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-markup-templating"
import "prismjs/components/prism-php"
import "prismjs/components/prism-ruby"
import "prismjs/components/prism-rust"
import "prismjs/components/prism-swift"
import "prismjs/components/prism-kotlin"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-css"
import './App.css'

const Editor = EditorModule.default.default

function App() {
  const [code, setCode] = useState('')
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('javascript')
function handleKeyDown(e) {
  if (e.key === 'Enter') {
    const textarea = e.target
    const start = textarea.selectionStart
    const value = textarea.value

    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const currentLine = value.slice(lineStart, start)
    const indentMatch = currentLine.match(/^\s*/)
    let indent = indentMatch ? indentMatch[0] : ''

    const trimmed = currentLine.trim()
    const endsWithOpenBrace = trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')

    if (endsWithOpenBrace) {
      e.preventDefault()
      const newIndent = indent + '  ' // 2-space indent, adjust as you like
      const newValue = value.slice(0, start) + '\n' + newIndent + value.slice(start)
      setCode(newValue)

      // move cursor to correct position after React re-renders
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + newIndent.length
      })
    } else if (indent) {
      // maintain current line's indentation on normal Enter
      e.preventDefault()
      const newValue = value.slice(0, start) + '\n' + indent + value.slice(start)
      setCode(newValue)

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
      })
    }
  }
}

  async function reviewCode() {
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/ai/get-review', { code, language })
      setReview(response.data)
    } catch (error) {
      setReview("Something went wrong while generating the review. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main>
        <div className="left">
          <h2 className="panel-header">Write your code here</h2>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="language-select">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="sql">SQL</option>
            <option value="bash">Bash</option>
            <option value="json">JSON</option>
            <option value="markup">HTML/XML</option>
            <option value="css">CSS</option>
          </select>
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              onKeyDown={handleKeyDown}
              highlight={code => prism.highlight(code, prism.languages[language] || prism.languages.javascript, language)}
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 16,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "100%",
                width: "100%",
                overflow: "auto"
              }}
            />
          </div>
          <div
            onClick={loading ? undefined : reviewCode}
            className={`review ${loading ? 'review-disabled' : ''}`}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Reviewing...
              </>
            ) : (
              "Review"
            )}
          </div>
        </div>
        <div className="right">
          <h2 className="panel-header">Review</h2>
          <div className="markdown-content">
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          </div>
        </div>
      </main>
    </>
  )
}

export default App