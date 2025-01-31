import React, { useState, useEffect } from "react";
import "./css/UploadModal.css";

const UploadModal = ({ currentDate, images, setImages }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  //--------------------------------------
  // 서버에서 받은 이미지를 미리보기로 추가 (currentDate 변경 시 초기화)
  //--------------------------------------

  //--------------------------------------
  // 서버에서 받은 이미지를 미리보기로 추가
  //--------------------------------------
  useEffect(() => {
    fetchImagesFromServer();
  }, [currentDate]); // ✅ currentDate가 변경될 때마다 실행

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
    setPreviewImages((prev) => [...prev, ...previewUrls]);
    setUploadedImages((prev) => [...prev, ...imageFiles]);
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
    setPreviewImages((prev) => [...prev, ...previewUrls]);
    setUploadedImages((prev) => [...prev, ...imageFiles]);
  };

  //--------------------------------------
  // 특정 이미지를 제거하는 함수 (서버에도 삭제 요청)
  //--------------------------------------
  const handleRemoveImage = async (index) => {
    // ✅ 새로 추가된 이미지인지 확인
    if (index < uploadedImages.length) {
      console.log("!!!!!!!! 새로 추가된 이미지, 서버 요청 없이 제거");

      // 새로 추가된 이미지는 서버 요청 없이 제거
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    // ✅ 서버에 저장된 이미지인 경우 요청 보냄
    const realIndex = index - uploadedImages.length; // 서버 이미지의 실제 인덱스
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const filename = images[realIndex]?.filename;
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
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
      setImages((prev) => prev.filter((_, i) => i !== realIndex));
      console.log("!!!!!!!! 이미지가 UI에서 제거되었습니다.");
    }
  };

  //--------------------------------------
  // 업로드 버튼 클릭 시 호출
  //--------------------------------------
  const handleUpload = async () => {
    if (uploadedImages.length === 0) {
      alert("업로드할 이미지가 없습니다.");
      return;
    }

    const formData = new FormData();
    uploadedImages.forEach((file) => {
      formData.append("files", file);
    });

    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, "0");
    formData.append("yyyy", yyyy);
    formData.append("mm", mm);

    try {
      const response = await fetch("http://localhost:8095/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("이미지 업로드가 완료되었습니다.");

        // ✅ 모달 닫기
        const exitButtonEl = document.querySelector(".btn-close");
        exitButtonEl.click();

        // ✅ 업로드가 완료된 후 서버에서 최신 이미지 목록을 다시 가져옴
        fetchImagesFromServer();
      } else {
        alert("업로드 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }

    setUploadedImages([]); // 새로 추가한 이미지는 초기화
  };

  //--------------------------------------
  // 업로드된 내용 패치
  //--------------------------------------
  // ✅ 서버에서 Base64 이미지 목록을 다시 가져오는 함수
  const fetchImagesFromServer = async () => {
    try {
      const response = await fetch(
        `http://localhost:8095/getAlbum/${currentDate.getFullYear()}/${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("data", data);

        if (data) {
          // ✅ 기존 이미지 + 새로 업로드한 이미지 유지
          const imageArray = Object.entries(data).map(([filename, base64]) => ({
            filename,
            base64: `data:image/jpeg;base64,${base64}`,
          }));

          setPreviewImages(imageArray.map((img) => img.base64)); // preview에 반영
          setImages(imageArray); // images 상태 업데이트
        }
      } else {
        setPreviewImages([]);
      }
    } catch (error) {
      console.error("Error fetching images from server:", error);
      setPreviewImages([]);
    }
  };

  return (
    <div
      className="modal fade uploadmodal"
      id="staticBackdrop2"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
     
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">UPLOAD</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
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
              {previewImages.length > 0 ? (
                <div className="preview-container">
                  {previewImages.map((src, index) => (
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
              className="btn btn-primary"
              onClick={handleUpload}
            >
              업로드 요청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
