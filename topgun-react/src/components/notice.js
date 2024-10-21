import { useCallback, useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';  // Quill 테마

const NoticeBoard = () => {
    const [noticeList, setNoticeList] = useState([]);
    const [input, setInput] = useState({
        title: "",
        content: "",
        author: "",
        createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    });

    useEffect(() => {
        loadList();
    }, []);

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
                await axios.delete(`http://localhost:8080/notice/${target.noticeId}`); // 수정된 부분
                setNoticeList(prevNotices => prevNotices.filter(notice => notice.noticeId !== target.noticeId)); // 수정된 부분
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

    const handleContentChange = useCallback(value => {
        setInput(prevInput => ({
            ...prevInput,
            content: value
        }));
    }, []);

    const addInput = useCallback(async () => {
        const newNotice = {
            title: input.title,
            content: input.content,
            author: input.author,
            createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        };

        try {
            const response = await axios.post("http://localhost:8080/notice/", newNotice);
            setNoticeList(prevNotices => [...prevNotices, response.data]);
            clearInput();
        } catch (error) {
            console.error("Failed to add notice:", error);
        }
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            title: "",
            content: "",
            author: "",
            createdAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
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
                            <th style={{ padding: '15px', textAlign: 'center', width: '10%' }}>글번호</th> {/* 글번호 칸의 너비 조정 */}
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>제목</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '20%' }}>작성자</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>작성일</th> {/* 작성일 칸의 너비 조정 */}
                            <th style={{ padding: '15px', textAlign: 'center', width: '10%' }}>메뉴</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.map((notice) => (
                            <tr key={notice.noticeId}>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {notice.noticeId}</td>
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
                                <ReactQuill
                                    theme="snow"
                                    value={input.content}
                                    onChange={handleContentChange}
                                    placeholder="내용을 입력하세요..."
                                    style={{ height: '200px' }} // 높이 조정
                                />
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default NoticeBoard;
