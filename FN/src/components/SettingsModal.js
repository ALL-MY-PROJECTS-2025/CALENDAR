import "./css/SettingsModal.css";

const SettingsModal = () => {
  return (
    <div
      className="modal fade settingmodal"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog  modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              환경설정
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="items">

            <div className="item">
                전체적용하기
            </div>

            <div className="item">
                YYYY/MM정보 선택 
            </div>

              <div className="item choose-layout">
                <div className="title">레이아웃</div>
                <div className="rowLayout">
                    <div className="imageblock">이미지</div>
                    <div className="contentblock">내용</div>
                </div>
                <div  className="colLayout">
                    <div className="imageblock">이미지</div>
                    <div className="contentblock">내용</div>
                </div>
              </div>
              <div className="item choose-layout-radio">
                    <div className="title">선택</div>
                    <div className="rowLayout">
                        <input type="radio" name="layout"  value="row" />
                    </div>
                    <div className="colLayout">
                        <input type="radio"  name="layout" value="col" />
                    </div>
              </div>
              <hr/>
            </div>
          </div>
          <div className="modal-footer">

            <button type="button" className="btn btn-primary">
              저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
