import { useCallback, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios"; // Axios 추가

const NoticeBoard = () => {
    const [noticeList, setNoticeList] = useState([]);
    const [input, setInput] = useState({
        title: "",
        content: "",
        author: "",
        createdAt: new Date().toISOString().slice(0, 16),
    });

    useEffect(() => {
        loadList(); // 컴포넌트가 렌더링될 때 공지사항 목록 불러오기
    }, []);

    // 공지사항 목록 불러오기
    const loadList = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:8080/notice/");
            setNoticeList(response.data);
        } catch (error) {
            console.error("Failed to load notice list:", error);
        }
    }, []);

    const deleteNotice = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice) {
            try {
                await axios.delete(`http://localhost:8080/notice/${target.notice_id}`);
                setNoticeList(prevNotices => prevNotices.filter(notice => notice.notice_id !== target.notice_id));
            } catch (error) {
                console.error("Failed to delete notice:", error);
            }
        }
    }, []);

    const changeInput = useCallback(e => {
        const { name, value } = e.target;
        setInput(prevInput => ({
            ...prevInput,
            [name]: value
        }));
    }, []);

    const addInput = useCallback(async () => {
        const newNotice = {
            title: input.title,
            content: input.content,
            author: input.author,
            createdAt: input.createdAt,
        };

        try {
            await axios.post("http://localhost:8080/notice/", newNotice);
            loadList(); // 공지사항 추가 후 목록 갱신
            clearInput();
        } catch (error) {
            console.error("Failed to add notice:", error);
        }
    }, [input, loadList]);

    const clearInput = useCallback(() => {
        setInput({
            title: "",
            content: "",
            author: "",
            createdAt: new Date().toISOString().slice(0, 16),
        });
    }, []);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return (
        <div className="row mt-4">
            <div className="col" style={{ display: 'flex', justifyContent: 'center' }}>
                <table className="table" style={{ width: '80%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'center' }}>글번호</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>제목</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>작성자</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>작성일</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>메뉴</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.map((notice) => (
                            <tr key={notice.notice_id}>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.notice_id}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {notice.title}
                                    {new Date(notice.createdAt) >= threeDaysAgo && 
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
                                        </span>}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.author}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>{notice.createdAt}</td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <FaTrash className="text-danger" onClick={() => deleteNotice(notice)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ textAlign: 'center' }}></td>
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
                                       onChange={changeInput} />
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button type="button"
                                        className="btn btn-success"
                                        onClick={addInput}>
                                    등록
                                </button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default NoticeBoard;
