import { useCallback, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const NoticeBoard = () => {
    const sampleNotices = [
        {
            notice_id: 1,
            title: "첫 번째 공지사항",
            content: "첫 번째 공지사항의 내용입니다.",
            author: "관리자",
            createdAt: "2024-10-17T10:00"
        },
        {
            notice_id: 2,
            title: "두 번째 공지사항",
            content: "두 번째 공지사항의 내용입니다.",
            author: "관리자",
            createdAt: "2024-10-14T15:00"
        }
    ];

    // 한국 시간을 반환하는 함수 (UTC에서 KST로 변환)
    const getKoreanTimeString = () => {
        const now = new Date();
        // UTC 기준으로 한국 시간 9시간 추가
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        return koreaTime.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM" 형식으로 반환
    };

    const [noticeList, setNoticeList] = useState(sampleNotices);
    const [input, setInput] = useState({
        title: "",
        content: "",
        author: "",
        createdAt: getKoreanTimeString() // 한국 시간 적용
    });

    useEffect(() => {
        // loadList(); // API 호출은 생략
    }, []);

    const deleteNotice = useCallback((target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice) {
            setNoticeList(prevNotices => prevNotices.filter(notice => notice.notice_id !== target.notice_id));
        }
    }, []);

    const changeInput = useCallback(e => {
        const { name, value } = e.target;
        setInput(prevInput => ({
            ...prevInput,
            [name]: value
        }));
    }, []);

    const addInput = useCallback(() => {
        // 모든 필드가 채워졌는지 확인
        if (!input.title || !input.content || !input.author) {
            alert("모든 필드를 채워주세요.");
            return;
        }
        const newNotice = {
            notice_id: noticeList.length + 1,
            ...input
        };
        setNoticeList(prevNotices => [...prevNotices, newNotice]);
        clearInput();
    }, [input, noticeList]);

    const clearInput = useCallback(() => {
        setInput({
            title: "",
            content: "",
            author: "",
            createdAt: getKoreanTimeString() // 새 입력 시에도 한국 시간 적용
        });
    }, []);

    // 현재 날짜 기준 3일 전 날짜 계산 (한국 시간으로)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return (
        <div className="row mt-4">
            <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                <table className="table" style={{ width: '80%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'center' }}>번호</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>제목</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>작성자</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>작성일</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>메뉴</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.map((notice) => {
                            const noticeDate = new Date(notice.createdAt);
                            const isNew = noticeDate >= threeDaysAgo; // 3일 이내 공지사항 체크
                            return (
                                <tr key={notice.notice_id}>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{notice.notice_id}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        {notice.title}
                                        {isNew && (
                                            <span style={{ 
                                                color: 'white', 
                                                backgroundColor: '#ec7393',
                                                padding: '3px 3px', 
                                                borderRadius: '5px', 
                                                fontSize: '0.9em', 
                                                marginLeft: '10px', 
                                                marginBottom: '10px' 
                                            }}>
                                                NEW
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{notice.author}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>{notice.createdAt}</td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <FaTrash className="text-danger" onClick={() => deleteNotice(notice)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td></td>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="제목"
                                       name="title"
                                       value={input.title}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="작성자"
                                       name="author"
                                       value={input.author}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="datetime-local" className="form-control"
                                       name="createdAt"
                                       value={input.createdAt}
                                       readOnly /> {/* 작성일은 자동으로 설정됨 */}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button type="button"
                                        className="btn btn-success"
                                        onClick={addInput}>
                                    등록
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="5">
                                <textarea className="form-control" 
                                          placeholder="내용" 
                                          name="content"
                                          value={input.content}
                                          onChange={changeInput}
                                          style={{ height: '150px' }}  // 콘텐츠 칸 크기 조정
                                ></textarea>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default NoticeBoard;
