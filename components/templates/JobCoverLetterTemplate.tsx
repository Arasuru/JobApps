"use client";

export default function JobCoverLetterTemplate({ clData, personalInfo }: { clData: any, personalInfo: any }) {
  if (!clData) return null;

  return (
    <div className="a4-document font-serif text-gray-900 leading-relaxed text-[11pt]">
      
      {/* SENDER BLOCK (Top Right) */}
      <div className="flex justify-end mb-10 print-avoid-break">
        <div className="text-right">
          <h1 className="text-xl font-bold font-sans text-gray-800" contentEditable suppressContentEditableWarning>
            {personalInfo.Firstname} {personalInfo.Lastname}
          </h1>
          <div className="text-gray-600 text-sm mt-1 flex flex-col items-end">
            <span contentEditable suppressContentEditableWarning>{personalInfo.location}</span>
            <span contentEditable suppressContentEditableWarning>{personalInfo.phone}</span>
            <span contentEditable suppressContentEditableWarning>{personalInfo.email}</span>
            {personalInfo.linkedin && <span contentEditable suppressContentEditableWarning>{personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* RECIPIENT & DATE BLOCK */}
      <div className="mb-10 print-avoid-break flex justify-between items-end">
        <div className="text-gray-800">
          <div className="font-bold" contentEditable suppressContentEditableWarning>{clData.recipientName}</div>
          <div contentEditable suppressContentEditableWarning>{clData.recipientTitle}</div>
          <div contentEditable suppressContentEditableWarning>{clData.companyName}</div>
        </div>
        <div className="text-gray-600" contentEditable suppressContentEditableWarning>
          {clData.date}
        </div>
      </div>

      {/* BODY */}
      <div className="mb-6 font-bold" contentEditable suppressContentEditableWarning>
        {clData.greeting}
      </div>

      <div className="space-y-4 text-gray-800 text-justify">
        {clData.paragraphs && clData.paragraphs.map((para: string, i: number) => (
          <p key={i} contentEditable suppressContentEditableWarning>
            {para}
          </p>
        ))}
      </div>

      {/* SIGN-OFF */}
      <div className="mt-12 print-avoid-break">
        <div className="mb-8" contentEditable suppressContentEditableWarning>
          {clData.signOff}
        </div>
        <div className="font-bold font-sans text-gray-800" contentEditable suppressContentEditableWarning>
          {personalInfo.Firstname} {personalInfo.Lastname}
        </div>
      </div>

    </div>
  );
}