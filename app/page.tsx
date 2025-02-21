'use client';

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css'; // 如果你同时使用了注释层

import { useState,useMemo,useRef } from 'react';
import Head from 'next/head';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, degrees } from 'pdf-lib';
import type { ChangeEvent } from 'react';

// 配置 pdfjs worker（确保 worker 文件路径正确）
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// 定义 PDF 加载成功后的参数类型
interface DocumentLoadSuccess {
  numPages: number;
}

const Home = () => {
  const [pdfData, setPdfData] = useState<any>(null);
  const fileSlice = useMemo(()=>pdfData?.slice(0),[pdfData])
  const [height, setHeight] = useState<number>(300);
  const [width, setWidth] = useState<number>(180);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [rotation, setRotation] = useState<Record<number, number>>({}); // 页码从 1 开始
  const [tipShow, setTipShow] = useState<boolean>(false);

  const wrapper = useRef<HTMLSpanElement>(null)
  const [{left, top, tipWidth}, setRect] = useState<Partial<DOMRect>>({})
  const style = {
    top: {left: `${left}px`, top: `${top}px`, height: '0px', width: `${tipWidth}px`, justifyContent:'center', alignItems:'end'},
  }

  // tip
  const tip = ()=>{
    <div>

    </div>
  }

  // 显示提示
  const show = (text:string) => {
    
  }


  // 处理文件选择
  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await file.arrayBuffer();
      setPdfData(data);
    }
  };

  // 移除pdf
  const remove = () => {
    setPdfData(null);
  }

  // PDF 加载成功后初始化页数和每页旋转角度
  const onDocumentLoadSuccess = ({ numPages }: DocumentLoadSuccess) => {
    setNumPages(numPages);
    const initRotation: Record<number, number> = {};
    for (let i = 1; i <= numPages; i++) {
      initRotation[i] = 0;
    }
    setRotation(initRotation);
  };

  // 单页旋转
  const handleRotate = (pageNumber: number, angle: number) => {
    setRotation((prev) => ({
      ...prev,
      [pageNumber]: (prev[pageNumber] + angle + 360) % 360
    }));
  };

  // 全部页面旋转
  const handleRotateAll = (angle: number) => {
    if (!numPages) return;
    const newRotations: Record<number, number> = {};
    for (let i = 1; i <= numPages; i++) {
      newRotations[i] = ((rotation[i] || 0) + angle + 360) % 360;
    }
    setRotation(newRotations);
  };

  // 下载旋转后的 PDF
  const handleDownload = async () => {
    if (!pdfData) return;
    const pdfDoc = await PDFDocument.load(fileSlice);
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      const currentRotation = rotation[index + 1] || 0;
      page.setRotation(degrees(currentRotation));
    });
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rotated.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 放大缩小
  const handleZoom = (type:string) => {
    if(type === 'plus') {
      setHeight(height=>height + 30);
      setWidth(width=>width + 18);
    } else {
      setHeight(height=>height - 30);
      setWidth(width=>width - 18);
    }
  }

  return (
    <>
      <Head>
        <title>PDF旋转工具 - 基于 Next.js 与 React-pdf</title>
        <meta
          name="description"
          content="使用 Next.js 和 React-pdf 实现的本地 PDF 旋转工具，无需上传文件即可轻松旋转 PDF 页面并下载结果。"
        />
        <meta name="keywords" content="PDF, 旋转, Next.js, React-pdf, PDF-lib, 本地处理, SEO" />
        {/* 根据需要添加 Open Graph、Twitter Card 等 SEO 标签 */}
      </Head>
      <div>
        <div className="h-16 border-b-1 px-4 flex justify-between font-semibold">
          <div className='flex items-center text-xl font-serif'>
            <svg viewBox="0 0 64 36" xmlns="http://www.w3.org/2000/svg" className='w-8 h-8'><path fill="black" d="M41.3111 0H37.6444C30.3111 0 24.6889 4.15556 21.7556 9.28889C18.8222 3.91111 12.9556 0 5.86667 0H2.2C0.977781 0 0 0.977779 0 2.2V5.86667C0 16.1333 8.31111 24.2 18.3333 24.2H19.8V33C19.8 34.2222 20.7778 35.2 22 35.2C23.2222 35.2 24.2 34.2222 24.2 33V24.2H25.6667C35.6889 24.2 44 16.1333 44 5.86667V2.2C43.5111 0.977779 42.5333 0 41.3111 0ZM19.3111 19.5556H17.8444C10.2667 19.5556 4.15556 13.4444 4.15556 5.86667V4.4H5.62222C13.2 4.4 19.3111 10.5111 19.3111 18.0889V19.5556ZM39.1111 5.86667C39.1111 13.4444 33 19.5556 25.4222 19.5556H23.9556V18.0889C23.9556 10.5111 30.0667 4.4 37.6444 4.4H39.1111V5.86667Z"></path></svg>
PDF.ai
          </div>
          <div className='flex font-thin items-center gap-6' style={{ "fontFamily": "Inter Segoe UI Helvetica Neue sans-serif"}}>
            <a className='hover:underline' href='#'>Pricing</a>
            <a className='hover:underline' href='#'>Chrome extension</a>
            <a className='hover:underline' href='#'>Use cases</a>
            <a className='hover:underline' href='#'>Get started →</a>
          </div>
        </div>
        <div className='bg-[#f7f5ee] flex justify-center flex-col items-center mx-auto py-20 space-y-5'>
          <div className='flex flex-col text-center !mb-10 space-y-5'>
            <h1 className='text-5xl font-serif'>Rotate PDF Pages</h1>
            <p className='mt-2 text-gray-600 max-w-lg mx-auto'>Simply click on a page to rotate it. You can then download your modified PDF.</p>
          </div>

          
        {pdfData ? (
          <>
            <div className="w-full">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <button className="bg-[#ff612f] rounded-md text-white p-2" onClick={() => handleRotateAll(90)}>
                <div>Rotate all</div>
              </button>
              <button onMouseEnter={()=>show("Rotate all")} onMouseLeave={()=>hide()} className="bg-gray-800 rounded-md text-white p-2" aria-label="Remove this PDF and select a new one" data-microtip-position="top" role="tooltip" onClick={remove}>
                <div>Remove PDF</div>
              </button>
              <button onClick={()=>handleZoom('plus')} className="bg-white shadow rounded-full p-2 flex items-center justify-center hover:scale-105 grow-0 shrink-0 disabled:opacity-50 " aria-label="Zoom in" data-microtip-position="top" role="tooltip">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"></path></svg>
              </button>
              <button onClick={()=>handleZoom('minus')} className="bg-white shadow rounded-full p-2 flex items-center justify-center hover:scale-105 grow-0 shrink-0 disabled:opacity-50 " aria-label="Zoom out" data-microtip-position="top" role="tooltip">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"></path></svg>
              </button>
            </div>
              <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} className="flex flex-row h-auto flex-wrap px-12 gap-6 justify-center">
                {numPages &&
                  Array.from({ length: numPages }, (_, index) => (
                    <div className='overflow-hidden transition-transform size-auto cursor-pointer relative' key={index} style={{'height': height, 'width': width}} onClick={() => handleRotate(index + 1, 90)}>
                      <div className='overflow-hidden relative h-full w-full flex flex-col justify-between items-center shadow-md p-3 bg-white hover:bg-gray-50 size-auto'>
                      <Page 
                        pageNumber={index + 1} 
                        rotate={rotation[index + 1] || 0} 
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        
                        className='w-full shrink'
                        height={height}
                        width={width}
                      />
                      <div className='w-[90%] text-center shrink-0 text-xs italic overflow-hidden text-ellipsis whitespace-nowrap'>{index + 1}</div>
                      <div className='absolute z-10 top-1 right-1 rounded-full p-1 hover:scale-105 hover:fill-white bg-[#ff612f] fill-white' onClick={() => handleRotate(index + 1, 90)}>
                      <svg className='w-3' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"></path></svg>
                      </div>
                    </div>
                    </div>
                  ))}
              </Document>
            </div>
              
            <div className="bg-[#ff612f] p-3 rounded-md text-white">
              <button onClick={handleDownload}>Download</button>
            </div>
          </>
        ):(<div className="w-full flex justify-center">
        <div className="h-[350px] relative text-center w-[275px]">
          <input className="cursor-pointer hidden" type="file" id="input-file-upload" accept=".pdf" onChange={onFileChange} />
          <label className="h-full flex items-center justify-center border rounded transition-all bg-white border-dashed border-stone-300" htmlFor="input-file-upload">
            <div className="cursor-pointer flex flex-col items-center space-y-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"></path></svg>
              <div className="pointer-events-none font-medium text-sm leading-6 pointer opacity-75">
                <div>Click to upload or drag and drop</div>
              </div>
            </div>
          </label>
        </div>
      </div>)}
        </div>
      </div>
        <div className="bg-white" aria-labelledby="footer-heading">
          <h2 id="footer-heading" className="sr-only">
            <div>
              <div>Footer</div></div></h2><div className="mx-auto max-w-7xl px-6 pb-8 mt-8 sm:mt-12 lg:px-8 lg:mt-16 border-t border-gray-900/10 pt-16"><div className="xl:grid xl:grid-cols-3 xl:gap-8"><div className="space-y-8"><img className="h-7" src="/favicon.ico" alt="PDF.ai logo"/><div className="text-sm leading-6 text-gray-600"><div ><div >Chat with any PDF: ask questions, get summaries, find information, and more.</div></div></div><div className="flex space-x-6"><a href="https://www.tiktok.com/@pdfai" className="text-gray-400 hover:text-gray-500" target="_blank"><span className="sr-only"><div ><div >TikTok</div></div></span><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2859 3333"  fillRule="evenodd" clipRule="evenodd" className="h-6 w-6" aria-hidden="true"><path d="M2081 0c55 473 319 755 778 785v532c-266 26-499-61-770-225v995c0 1264-1378 1659-1932 753-356-583-138-1606 1004-1647v561c-87 14-180 36-265 65-254 86-398 247-358 531 77 544 1075 705 992-358V1h551z"></path></svg></a><a href="https://www.instagram.com/pdfdotai/" className="text-gray-400 hover:text-gray-500" target="_blank"><span className="sr-only"><div ><div >Instagram</div></div></span><svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path  fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg></a><a href="https://twitter.com/pdfdotai" className="text-gray-400 hover:text-gray-500" target="_blank"><span className="sr-only"><div ><div >Twitter</div></div></span><svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a><a href="https://www.youtube.com/@pdfai" className="text-gray-400 hover:text-gray-500" target="_blank"><span className="sr-only"><div ><div >YouTube</div></div></span><svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true"><path  fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg></a></div></div><div className="mt-16 grid grid-cols-1 gap-8 xl:col-span-2 xl:mt-0"><div className="md:grid md:grid-cols-3 md:gap-8"><div><h3 className="text-sm font-semibold leading-6 text-gray-900"><div ><div >Products</div></div></h3><ul role="list" className="mt-6 space-y-4 list-none p-0"><li className="p-0 m-0"><a href="/use-cases" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Use cases</div></div></a></li><li className="p-0 m-0"><a href="/chrome-extension" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Chrome extension</div></div></a></li><li className="p-0 m-0"><a href="https://api.pdf.ai/" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >API docs</div></div></a></li><li className="p-0 m-0"><a href="/pricing" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Pricing</div></div></a></li><li className="p-0 m-0"><a href="/tutorials" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Video tutorials</div></div></a></li><li className="p-0 m-0"><a href="/resources" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Resources</div></div></a></li><li className="p-0 m-0"><a href="/blog" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Blog</div></div></a></li><li className="p-0 m-0"><a href="/faq" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >FAQ</div></div></a></li></ul></div><div className="mt-10 md:mt-0"><h3 className="text-sm font-semibold leading-6 text-gray-900"><div ><div >We also built</div></div></h3><ul role="list" className="mt-6 space-y-4 list-none p-0"><li className="p-0 m-0"><a href="https://pdf.ai/tools/resume-ai-scanner" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Resume AI Scanner</div></div></a></li><li className="p-0 m-0"><a href="https://pdf.ai/tools/invoice-ai-scanner" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Invoice AI Scanner</div></div></a></li><li className="p-0 m-0"><a href="https://pdf.ai/tools/quiz-ai-generator" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >AI Quiz Generator</div></div></a></li><li className="p-0 m-0"><a href="https://quickyai.com" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >QuickyAI</div></div></a></li><li className="p-0 m-0"><a href="https://docsium.com" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Doctrine</div></div></a></li><li className="p-0 m-0"><a href="https://pdf.ai/gpts" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >PDF GPTs</div></div></a></li><li className="p-0 m-0"><a href="https://pdfgen.com" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >PDF AI generator</div></div></a></li><li className="p-0 m-0"><a href="https://pdf.ai/tools" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Other PDF tools</div></div></a></li></ul></div><div className="mt-10 md:mt-0"><h3 className="text-sm font-semibold leading-6 text-gray-900"><div ><div >Company</div></div></h3><ul role="list" className="mt-6 space-y-4 list-none p-0"><li className="p-0 m-0"><a href="/compare/chatpdf-alternative" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >PDF.ai vs ChatPDF</div></div></a></li><li className="p-0 m-0"><a href="/compare/adobe-acrobat-reader-alternative" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >PDF.ai vs Acrobat Reader</div></div></a></li><li className="p-0 m-0"><a href="/privacy-policy" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Legal</div></div></a></li><li className="p-0 m-0"><a href="/affiliate-program" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Affiliate program 💵</div></div></a></li><li className="p-0 m-0"><a href="/investor" className="text-sm leading-6 text-gray-600 hover:text-gray-900"><div ><div >Investor</div></div></a></li></ul></div></div></div></div></div></div>
      
      <style jsx>{`
        
      `}</style>
    </>
  );
};

export default Home;
