import React, { useState, useEffect } from "react";
import "./css/UploadModal.css";
import { API_URLS } from '../api/apiConfig';

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
    // ✅ 새로 추가된 이미지인지 확인
    if (index < props.uploadedImages.length) {
      console.log("!!!!!!!! 새로 추가된 이미지, 서버 요청 없이 제거");

      // 새로 추가된 이미지는 서버 요청 없이 제거
      props.setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      props.setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // ✅ 서버에 저장된 이미지인 경우 요청 보냄
    const realIndex = index - props.uploadedImages.length; // 서버 이미지의 실제 인덱스
    const year = props.currentDate.getFullYear();
    const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");
    const filename = props.images[realIndex]?.filename;
    const filePath = filename ? `${year}/${month}/${filename}` : null;

    try {
      if (filePath) {
        console.log("!!!!!!!! 서버 저장된 이미지, 삭제 요청 보냄:", filePath);

        const response = await fetch(`http://localhost:8095/deleteImage`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath }),
        });

        if (response.ok) {
          console.log("!!!!!!!! 서버 삭제 완료:", filePath);
        } else {
          console.error("!!!!!!!! 서버에서 이미지 삭제 실패");
        }
      }
    } catch (error) {
      console.error("!!!!!!!! 이미지 삭제 중 오류 발생:", error);
    } finally {
      // ✅ 서버 응답과 관계없이 UI에서 삭제
      props.setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      props.setImages((prev) => prev.filter((_, i) => i !== realIndex));
      console.log("!!!!!!!! 이미지가 UI에서 제거되었습니다.");
    }
  };

  //--------------------------------------
  // 업로드 버튼 클릭 시 호출
  //--------------------------------------
  const handleUpload = async () => {
    if (!props.uploadedImages.length) return;

    const formData = new FormData();
    props.uploadedImages.forEach((file) => {
      formData.append("files", file);
    });

    const year = props.currentDate.getFullYear();
    const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");

    try {
      const response = await fetch(
        `${API_URLS.album.get(year, month)}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("업로드 실패");
      }

      alert("이미지 업로드가 완료되었습니다.");
      onClose(); // 모달 닫기
      fetchImagesFromServer(); // 이미지 목록 새로고침
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
    }

    props.setUploadedImages([]); // 새로 추가한 이미지는 초기화
  };

  //--------------------------------------
  // 업로드된 내용 패치
  //--------------------------------------
  const fetchImagesFromServer = async () => {
    try {
      const response = await fetch(
        `http://localhost:8095/getAlbum/${props.currentDate.getFullYear()}/${String(props.currentDate.getMonth() + 1).padStart(2, "0")}`
      );
  
      // 🔹 응답이 JSON인지, 또는 비어 있는지 체크
      const contentType = response.headers.get("content-type");
      const contentLength = response.headers.get("content-length");
  
      if (!response.ok) {
        console.warn("⚠️ 서버에서 정상적인 응답을 받지 못함:", response.status);
        return;
      }
  
      if (!contentType || !contentType.includes("application/json") || contentLength === "0") {
        console.warn("⚠️ 응답이 비어 있음 또는 JSON이 아님");
        props.setPreviewImages([]); // 미리보기 초기화
        return;
      }
  
      const data = await response.json();
      console.log("📌 가져온 이미지 데이터(UPLOADMODAL):", data);
  
      if (data) {
        const imageArray = Object.entries(data).map(([filename, base64]) => ({
          filename,
          base64: `data:image/jpeg;base64,${base64}`,
        }));
  
        props.setPreviewImages(imageArray.map((img) => img.base64)); // ✅ 미리보기 업데이트
        props.setImages(imageArray); // ✅ images 상태 업데이트
      }
    } catch (error) {
      console.error("❌ 이미지 데이터 가져오기 오류:", error);
      props.setPreviewImages([]); // 미리보기 초기화
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
