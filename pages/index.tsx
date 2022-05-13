/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Upload, { UploadProps } from 'rc-upload'
import { createWorker } from 'tesseract.js'
import { abort } from 'process'
import { useState } from 'react'



const Home: NextPage = () => {
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const worker = createWorker({
    logger: m => {
      console.log(m) // Add logger here
      if (m.status === 'recognizing text') {
        setOutput(`Loading... ${ parseInt( `${m.progress * 100}` ) | 0 }%`);
      }
    }
  });

  const props:UploadProps = {
    action: () => {
      return "#";
    },
    multiple: false,
    onStart(file:any) {
      console.log('onStart', file, file.name);
    },
    onSuccess(ret:any) {
      console.log('onSuccess', ret);
    },
    onError(err:any) {
      console.log('onError', err);
    },
    beforeUpload(file:any, fileList:any) {
      setOutput("Loading...");
      console.log(file);
      return (async () => {
        const base64:string|null|ArrayBuffer = await new Promise(resolve => {
          const fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = () => {
            setInput(`${fileReader.result}`);
            resolve(fileReader.result);
          };
        });
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(`${base64}`);
        setOutput(text);
        await worker.terminate();
        return false;
      })();
    },
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Upload {...props}>
          <button>Upload</button>
        </Upload>
        <code style={{"width":"250px", "marginTop":"20px"}}>{output}</code>
        {input != "" &&
        <div>
          <img style={{"width":"250px", "marginTop":"20px"}} src={input} alt="Input" />
        </div>
      }
      </main>
    </div>
  )
}

export default Home
