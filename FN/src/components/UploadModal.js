import React from "react";
import "./css/UploadModal.css";
import api from '../api/apiConfig';

const UploadModal = ({ onClose, ...props }) => {
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
  // 특정 이미지를 제거하는 함수
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
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류 발생:", error);
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
    props.uploadedImages.forEach((file) => {
      formData.append("files", file);
    });

    const year = props.currentDate.getFullYear();
    const month = String(props.currentDate.getMonth() + 1).padStart(2, "0");
    formData.append("yyyy", year);
    formData.append("mm", month);

    try {
      await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("이미지 업로드가 완료되었습니다.");
      props.setUploadedImages([]);
      fetchImagesFromServer();
      onClose();
    } catch (error) {
      console.error("업로드 중 오류 발생:", error);
      if (error.response) {
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
        console.error("이미지 데이터 가져오기 오류:", error);
      }
      props.setPreviewImages([]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-modal">
        <div className="modal-header">
          <h5>UPLOAD</h5>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div
            className="upload-block"
            onDragOver={handleonDragOver}
            onDragLeave={handleonDragLeave}
            onDrop={handleFileDrop}
          >
            이미지를 드래그 해 주세요
          </div>
          
          <div className="preview">
            {props.previewImages.length > 0 ? (
              <div className="preview-container">
                {props.previewImages.map((src, index) => (
                  <div key={index} className="preview-image-wrapper">
                    <img
                      src={src}
                      alt={`preview-${index}`}
                      className="preview-image"
                    />
                    <button
                      className="remove-image-button"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-images">-</p>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <input
            type="file"
            onChange={handleAddFormdata}
            accept="image/*"
            id="file-input"
            multiple
            hidden
          />
          <button 
            className="file-button"
            onClick={() => document.getElementById("file-input").click()}
          >
            파일올리기
          </button>
          <button
            className="upload-button"
            onClick={handleUpload}
          >
            업로드 요청
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
