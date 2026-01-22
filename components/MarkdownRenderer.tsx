
import React from 'react';

interface Props {
  content: string;
}

export const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  const lines = content.split('\n');
  
  const parseInline = (text: string) => {
    // Handle bold text **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-gray-300 leading-relaxed font-light">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-xl font-bold text-indigo-400 mt-6 mb-2">{parseInline(line.replace('### ', ''))}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4 border-b border-gray-800 pb-2">{parseInline(line.replace('## ', ''))}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-3xl font-bold text-white mb-6 tracking-tight">{parseInline(line.replace('# ', ''))}</h1>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={idx} className="ml-6 list-disc mb-1 pl-2 marker:text-indigo-500">{parseInline(line.substring(2))}</li>;
        }
        if (line.match(/^\d+\./)) {
          return <div key={idx} className="ml-2 mb-2 font-semibold text-indigo-200">{parseInline(line)}</div>;
        }
        
        return <p key={idx} className="text-gray-300">{parseInline(line)}</p>;
      })}
    </div>
  );
};
