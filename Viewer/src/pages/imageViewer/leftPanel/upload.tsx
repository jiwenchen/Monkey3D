import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'umi';
import styles from './upload.less';

interface UploadStateType {}

const { NODE_ENV } = process.env;
const viewerPath = NODE_ENV == 'development' ? '' : '/imageViewer';
const uploadPath = `${window.location.protocol}//${
  window.location.host + viewerPath
}/worker/UploadWork.js`;

const Upload: React.FC<UploadStateType> = ({}) => {
  const intl = useIntl();
  //webWorker队列
  const [workers, setWorkers] = useState<any[]>([]);
  //webWorker数量设置
  const workerNum = 4;
  //记录studyInstanceUID（设置收藏）

  let eleInput: any = null;

  useEffect(() => {
    const workers1: React.SetStateAction<any[]> = [];
    for (let i = 0; i < workerNum; i++) {
      const worker: any = new Worker(uploadPath);
      workers1.push(worker);
    }
    setWorkers(workers1);
    return () => {
      workers1.forEach((item) => {
        item.terminate();
      });
    };
  }, []);

  const handleUpload = () => {
    if (!eleInput || eleInput.value === null || eleInput.value === '') return;

    const origin = window.location.origin;
    const eleInputValue = eleInput && eleInput.files ? eleInput.files : [];
    if (eleInputValue.length > 4000) {
      message.info(
        intl.formatMessage({
          id: 'limitDICOM',
        }),
      );
      return;
    }
    let files: any[] = [];
    for (let i = 0; i < eleInputValue.length; i++) {
      files.push({
        file: eleInputValue[i],
        state: eleInputValue[i].state,
        name: eleInputValue[i].name,
      });
    }

    const newFilesArr: any[] = [];
    const formArr: any[] = [];
    const toAjax = (newFiles: any[], form: any[]) => {
      const formFiles: any[] = [];
      let filesIdx = 0;
      mapFiles(files[filesIdx].file);
      function mapFiles(file: Blob) {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function () {
          // const arrayBuffer: any = reader.result;
          // const byteArray = new Uint8Array(arrayBuffer);
          try {
            formFiles.push(files[filesIdx]);
          } catch (error) {
            formFiles.push(false);
          }
          if (formFiles.length === files.length) {
            for (let i = 0; i < formFiles.length; i++) {
              if (formFiles[i] !== false) {
                formFiles[i].state = 'wait';
                newFiles.push(formFiles[i]);
                form.push(formFiles[i].file);
              }
            }

            let currentFileIndex = 0;

            for (let i = 0; i < workerNum; i++) {
              StartWorker(i);
            }
            function StartWorker(idx: number) {
              const fileIndex = currentFileIndex;
              currentFileIndex = currentFileIndex + 1;
              if (form[fileIndex] !== undefined) {
                workers[idx].postMessage({
                  origin: origin,
                  form: form[fileIndex],
                });
                workers[idx].onmessage = function (event: { data: any }) {
                  if (newFiles) {
                    const data = event.data;
                    new Promise(function (resolve) {
                      if (data === 'response') {
                        // eslint-disable-next-line @typescript-eslint/no-shadow
                        const file = form[fileIndex];
                        for (let i = 0; i < newFiles.length; i++) {
                          if (newFiles[i].file.webkitRelativePath === file.webkitRelativePath) {
                            newFiles.splice(i, 1);
                            break;
                          }
                        }
                        console.log('成功');
                      } else {
                        newFiles[fileIndex].state = 'error';
                        console.log('失败');
                      }
                    }).then(() => {
                      StartWorker(idx);
                    });
                  }
                };
              }
            }
          } else {
            filesIdx++;
            mapFiles(files[filesIdx].file);
          }
        };
      }
    };
    toAjax(newFilesArr, formArr);
  };

  const clickFileupload = () => {
    const fileupload = document.getElementById('fileupload');
    if (fileupload) {
      fileupload.click();
    }
  };

  return (
    <>
      <div className={styles.btn}>
        <Button onClick={clickFileupload}>upload</Button>
        <input
          style={{
            display: 'none',
          }}
          ref={(el) => (eleInput = el)}
          onChange={() => handleUpload()}
          id="fileupload"
          type="file"
          multiple={true}
          accept="*/*"
          //@ts-ignore
          webkitdirectory="true"
        />
      </div>
    </>
  );
};
export default Upload;
