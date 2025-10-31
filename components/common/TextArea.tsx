
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, ...props }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-cyber-accent mb-2">{label}</label>
      <textarea
        {...props}
        className="w-full h-48 bg-cyber-secondary border border-cyber-accent text-cyber-text font-mono p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-cyber-accent-hover shadow-inner resize-y"
      />
    </div>
  );
};

export default TextArea;
