import React, { useContext, useEffect, useRef, useState } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useProto } from './useProto';
import { GlobalStateContext } from '../../context/GlobalStateContext';

SyntaxHighlighter.registerLanguage('jsx', jsx);

const Proto: React.FC = () => {
  const { iframeRef, text, handleChange, resetContent } = useProto();
  const { protoStateService } = useContext(GlobalStateContext);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const syntaxHighlighterRef = useRef<HTMLDivElement>(null);
  const [isEditorVisible, setEditorVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (syntaxHighlighterRef.current && inputRef.current) {
        syntaxHighlighterRef.current.scrollTop = inputRef.current.scrollTop;
      }
    };

    const textarea = inputRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  return (
    <div className="p-8 flex flex-col h-full w-full relative">
      <section className="flex flex-col flex-grow h-full relative mt-8">
        <iframe
          title="prototype view"
          ref={iframeRef}
          className="h-[82vh] w-full rounded-lg overflow-hidden"
          src=""
        ></iframe>
        <span
          className="p-2 bg-dark w-full rounded-lg opacity-[90] max-h-[82vh] absolute transition-all duration-500 ease-in-out"
          style={
            isEditorVisible
              ? { height: '82vh', overflow: 'scroll' }
              : {
                  height: '3rem',
                  overflow: 'hidden',
                  backgroundColor: 'transparent',
                }
          }
        >
          {isEditorVisible && (
            <>
              <textarea
                ref={inputRef}
                spellCheck="false"
                className="bg-transparent h-full w-full rounded-lg p-4 text-base text-transparent font-mono mt-2 focus:ring-0 focus:ring-acai-purple focus:ring-opacity-50"
                value={text}
                onScroll={(e) => {
                  if (syntaxHighlighterRef.current) {
                    syntaxHighlighterRef.current.scrollTop =
                      e.currentTarget.scrollTop;
                  }
                }}
                style={{
                  lineHeight: '1.5rem',
                  margin: '2rem',
                  padding: '0',
                  caretColor: '#E7E9E5',
                  height: isEditorVisible ? 'calc(82vh - 2rem)' : '1rem',
                  maxHeight: 'calc(82vh - 2rem)',
                  position: 'absolute',
                  zIndex: 1,
                  whiteSpace: 'pre', // Prevent text wrapping
                  overflow: 'auto', // Handle overflow
                }}
                wrap="off" // Disable text wrapping
                onChange={(e) => handleChange(e.target.value)}
                onBlur={() => {
                  protoStateService.send({
                    type: 'UPDATE_FILE_CONTENT',
                    fileContent: text,
                  });
                }}
              ></textarea>
              <div
                ref={syntaxHighlighterRef}
                style={{
                  overflow: 'auto',
                  height: isEditorVisible ? 'calc(82vh - 2rem)' : '0',
                  lineHeight: '1.5rem',
                  padding: '1rem',
                  margin: '0',
                }}
              >
                <SyntaxHighlighter
                  language="tsx"
                  style={oneDark}
                  customStyle={{
                    fontSize: '1rem',
                    borderRadius: '0.5rem',
                    zIndex: 0,
                    lineHeight: '1.5rem',
                    padding: '1rem',
                    margin: '0',
                  }}
                >
                  {text}
                </SyntaxHighlighter>
              </div>
              <button
                className="absolute top-4 right-12 m-2 text-xs font-bold text-acai-white z-10"
                onClick={resetContent}
              >
                Reset
              </button>
            </>
          )}

          <button
            onClick={() => setEditorVisible(!isEditorVisible)}
            className="absolute top-4 right-6 m-2 text-xs font-bold text-acai-white z-10"
          >
            {!isEditorVisible ? 'view code' : 'x'}
          </button>
        </span>
      </section>
    </div>
  );
};

export default Proto;
