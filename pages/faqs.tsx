import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import React from "react";
import Link from "next/link";

import hljs from "highlight.js";

export default function Review() {
  // Create a ref for the div element
  const textDivRef = useRef<HTMLDivElement>(null);
  const [faqTopicInput, setFAQTopicInput] = useState("");
  const [siteIdInput, setSiteIdInput] = useState("");
  const [faqNumberInput, setFAQNumberInput] = useState("1");
  const [result, setResult] = useState(() => "");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const response = await fetch("/api/faqs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ faqTopic: faqTopicInput, siteId: siteIdInput, faqNumber: faqNumberInput }),
    });
    const data = await response.json();
    console.log("data", data);
    console.log("data.result", data.result);

    const hljsResult = hljs.highlightAuto(data.result).value;
    setResult(hljsResult);

    setFAQTopicInput("");
    setIsLoading(false);
  }

  return (
    <div>
       <Head>
      <title>Liferay OpenAI Demo Content Wizard - FAQ Generator </title>
      <meta name="description" content="" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0b1d67] to-[#204f79]">
        
        <div className="fixed top-0 left-5 p-5">
          <Link
            className="rounded-xl p-1 text-white "
            href="/"
          >
            <h3 className="text-1xl font-bold text-[hsl(210,70%,70%)]">← Return to Index</h3>
          </Link>
        </div>

        <div className="fixed top-2 right-5 p-5 text-lg download-options p-5 rounded">
            <button className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>FAQ Structure</span>
            </button>&nbsp;
            <button className="bg-gray-200 hover:bg-grey text-grey-lightest font-bold py-2 px-4 rounded inline-flex items-center">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                <span>FAQ Fragment</span>
            </button>
        </div>
        
        <h3 className="text-slate-200 font-bold text-3xl mb-3">
          Liferay FAQ Generator (In Development) 
        </h3>
        <p className="text-slate-400 text-center text-lg mb-3">
          <i>Type your topic in the field below and wait for your FAQs. <br/> Leave the field blank for a random faq topic.</i>
        </p>
        <form onSubmit={onSubmit}>
          <label className="text-slate-200">
            Enter a FAQ topic:
            <input
                className="text-sm text-gray-base w-full 
                                   mr-3 py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded mb-2"
                type="text"
                name="topic"
                placeholder="Enter a faq topic"
                value={faqTopicInput}
                onChange={(e) => setFAQTopicInput(e.target.value)}
              />
          </label>

          <div className="flex flex-row">

          <label className="text-slate-200 w-70 mr-3">
              Number of Q&A Pairs to Create (Max 10)
              <input
                className="text-sm text-gray-base w-full 
                                  py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded mb-2"
                type="text"
                name="faqNumber"
                placeholder="Number of FAQ posts"
                value={faqNumberInput}
                onChange={(e) => setFAQNumberInput(e.target.value)}
              />
            </label>
            <label className="text-slate-200 w-30">
              Site Id
              <input
                className="text-sm text-gray-base w-full 
                                   py-5 px-4 h-2 border 
                                  border-gray-200 text-slate-700 rounded mb-2"
                type="text"
                name="siteId"
                placeholder="Enter a site id"
                value={siteIdInput}
                onChange={(e) => setSiteIdInput(e.target.value)}
              />
            </label>
          </div>
          
          <button
            className="text-sm w-full bg-blue-600 h-7 text-white
                              rounded-2xl mb-10"
            type="submit"
          >
            Generate FAQs
          </button>
        </form>
        {isLoading ? (
          <div>
            <p className="text-slate-200">Generating content... be patient.. </p>

            <div role="status">
                <svg aria-hidden="true" className="mx-auto mt-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : result ? (
          <div className="relative w-2/4 ">
            <div className="rounded-md border-spacing-2 border-slate-900 bg-slate-100 break-words max-w-500 overflow-x-auto  ">
              <div
                ref={textDivRef}
                className="m-5 "
                dangerouslySetInnerHTML={{ __html: result }}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}


