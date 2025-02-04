import React, { useState, useEffect } from "react";
import "./css/UploadModal.css";
import api from '../api/apiConfig';

const UploadModal = ({ onClose, ...props }) => {
  // Bootstrap 모달 인스턴스 참조를 위한 상태 추가
  const [modalInstance, setModalInstance] = useState(null);

  // 모달 초기화
  useEffect(() => {
    const modalElement = document.getElementById('staticBackdrop2');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
      });
      setModalInstance(modal);
    }
  }, []);

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 backdrop 제거
    return () => {
      const backdrops = document.getElementsByClassName('modal-backdrop');
      if (backdrops.length > 0) {
        Array.from(backdrops).forEach(backdrop => {
          document.body.removeChild(backdrop);
        });
      }
      // body에서 modal-open 클래스도 제거
      document.body.classList.remove('modal-open');
    };
  }, []);

  //--------------------------------------
  // 서버에서 받은 이미지를 미리보기로 추가
  //--------------------------------------
  // useEffect(() => {
  //   fetchImagesFromServer();
  // }, [currentDate]); // ✅ currentDate가 변경될 때마다 실행

  //--------------------------------------
  // 드래그시 스타일링
  //--------------------------------------
  const handleonDragOver = (e)=>{
    e.preventDefault();
    e.target.setAttribute('style','border : 3px dotted gray;font-size:1rem;background-color:lightgray;opacity:.5;color:black;')
  }

  const handleonDragLeave = (e)=>{
    e.preventDefault();
    e.target.setAttribute('style','border : 1px dotted gray;font-size:1rem;background-color:white;opacity:1;color:gray;')
  }
  //--------------------------------------
  // 파일을 드롭했을 때 처리하는 핸들러
  //--------------------------------------
  const handleFileDrop = (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));

    // ✅ 기존 이미지 유지 + 새 이미지 추가
    props.setPreviewImages((prev) => [...prev, ...previewUrls]);
    props.setUploadedImages((prev) => [...prev, ...imageFiles]);
  };
  //--------------------------------------
  // 파일 올리기 버튼 클릭 시 form 추가
  //--------------------------------------
  const handleAddFormdata = (e) => {
    e.preventDefault();

    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    props.setPreviewImages((prev) => [...prev, ...previewUrls]);
    props.setUploadedImages((prev) => [...prev, ...imageFiles]);
  };

  //--------------------------------------
  // 특정 이미지를 제거하는 함수 (서버에도 삭제 요청)
  //--------------------------------------
  const handleRemoveImage = async (index) => {
    if (index < props.uploadedImages.length) {
      props.setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      props.setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    const realIndex = index - props.uploadedImages.length;
    const year = props.currentDate.getFullYear();
    const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");
    const filename = props.images[realIndex]?.filename;
    const filePath = filename ? `${year}/${month}/${filename}` : null;

    try {
      if (filePath) {
        await api.delete('/deleteImage', {
          data: { filePath }
        });
        console.log("!!!!!!!! 서버 삭제 완료:", filePath);
      }
    } catch (error) {
      console.error("!!!!!!!! 이미지 삭제 중 오류 발생:", error);
    } finally {
      props.setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      props.setImages((prev) => prev.filter((_, i) => i !== realIndex));
    }
  };

  //--------------------------------------
  // 업로드 버튼 클릭 시 호출
  //--------------------------------------
  const handleUpload = async () => {
    if (!props.uploadedImages.length) return;

    const formData = new FormData();
    // 파일들을 formData에 추가 - 서버가 요구하는 "files" 파라미터명 사용
    props.uploadedImages.forEach((file) => {
      formData.append("files", file);  // "file" 대신 "files"로 변경
    });

    // year와 month를 서버가 요구하는 파라미터명으로 추가
    const year = props.currentDate.getFullYear();
    const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");
    formData.append("yyyy", year);    // "year" 대신 "yyyy"
    formData.append("mm", month);     // "month" 대신 "mm"

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("이미지 업로드가 완료되었습니다.");
      props.setUploadedImages([]); // 새로 추가한 이미지는 초기화
      fetchImagesFromServer(); // 이미지 목록 새로고침
      onClose(); // 모달 닫기
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
        alert(`업로드 실패: ${error.response.data.message || '알 수 없는 오류가 발생했습니다.'}`);
      } else {
        alert("업로드에 실패했습니다. 네트워크 연결을 확인해주세요.");
      }
    }
  };

  //--------------------------------------
  // 업로드된 내용 패치
  //--------------------------------------
  const fetchImagesFromServer = async () => {
    try {
      const year = props.currentDate.getFullYear();
      const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");
      
      const response = await api.get(`/getAlbum/${year}/${month}`);
      const data = response.data;
      
      if (data) {
        const imageArray = Object.entries(data).map(([filename, base64]) => ({
          filename,
          base64: `data:image/jpeg;base64,${base64}`,
        }));

        props.setPreviewImages(imageArray.map((img) => img.base64));
        props.setImages(imageArray);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("❌ 이미지 데이터 가져오기 오류:", error);
      }
      props.setPreviewImages([]);
    }
  };
  
  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show uploadmodal"
        id="staticBackdrop2"
        style={{ display: 'block' }}
        tabIndex="-1"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">UPLOAD</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div
                className="upload-block"
                onDragOver={(e) => handleonDragOver(e)}
                onDragLeave={(e) => handleonDragLeave(e)}
                onDrop={handleFileDrop}
                style={{fontSize : "1rem"}}
              >
                이미지를 드래그 해 주세요
              </div>
              <div className="preview">
                {props.previewImages.length > 0 ? (
                  <div className="preview-container">
                    {props.previewImages.map((src, index) => (
                      <div
                        key={index}
                        className="preview-image"
                        style={{ 
                          position: "relative" ,  
                          margin : "10px",
                          border:"1px solid lightgray",
                          display:"flex",
                          justifyContent:"center",
                          alignItems:"center",
                          overflow:"hidden",
                          
                        }}
                      >
                        <img
                          src={src}
                          alt={`preview-${index}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          
                          }}
                        />
                        <button
                          style={{
                            backgroundColor:"red",
                            border:"0",
                            color:"white",
                            position:"absolute",
                            right:"0px",
                            top:"0px",
                            borderRadius:"50%",
                            width:"20px",
                            height:"20px",
                            display:"flex",
                            justifyContent : "center",
                            alignItems:"center"
                            
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <input
                type="file"
                className="btn"
                onChange={handleAddFormdata}
                multiple
                style={{ display: "none" }}
                id="file-input"
              />
              <button className="btn btn-success">
                <label htmlFor="file-input">파일올리기</label>
              </button>
              <button
                type="button"
                className="btn btn-primary upload-btn"
                onClick={handleUpload}
              >
                업로드 요청
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadModal;
