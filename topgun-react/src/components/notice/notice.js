import { useCallback, useState, useEffect, useMemo } from "react";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom"; 
import axios from "axios";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'; 

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
            alert("공지사항 목록을 불러오는 데 실패했습니다.");
        }
    }, []);

    const deleteNotice = useCallback(async (target) => {
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if (choice) {
            try {
                await axios.delete(`http://localhost:8080/notice/${target.noticeId}`);
                setNoticeList(prevNotices => prevNotices.filter(notice => notice.noticeId !== target.noticeId));
            } catch (error) {
                console.error("Failed to delete notice:", error);
                alert("공지사항 삭제에 실패했습니다.");
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
            alert("공지사항 추가에 실패했습니다.");
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

    // 이미지 업로드 핸들러
    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post("http://localhost:8080/upload", formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                const imageUrl = response.data.url; // 서버에서 이미지 URL을 응답받음
                const quill = document.querySelector('.ql-editor');
                const range = quill.getSelection();
                quill.insertEmbed(range.index, 'image', imageUrl);
            } catch (error) {
                console.error("Failed to upload image:", error);
                alert("이미지 업로드에 실패했습니다.");
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                ['link', 'image'], // 이미지 버튼 추가
                [{ 'align': [] }],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']                                        
            ],
            handlers: {
                'image': handleImageUpload // 이미지 버튼 핸들러
            }
        }
    }), []); // 빈 배열로 의존성을 지정하여 재렌더링 방지

    return (
        <div className="row mt-4">
            <div className="col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>NOTICE</h1>
                <hr style={{ width: '80%', border: '1px solid #ec7393', marginBottom: '20px' }} />
                <table className="table" style={{ width: '80%', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'center', width: '10%' }}>NO.</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>TITLE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '20%' }}>AUTHOR</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '30%' }}>DATE</th>
                            <th style={{ padding: '15px', textAlign: 'center', width: '10%' }}>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {noticeList.map((notice) => (
                            <tr key={notice.noticeId}>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    {notice.noticeId}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <Link to={`/notice/${notice.noticeId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {notice.title}
                                    </Link>
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
                                    <FaTrash className="text-danger" style={{ color: '#ec7393', fill: '#ec7393', fontSize: '1em' }} onClick={() => deleteNotice(notice)} />
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
                                    className="btn"
                                    style={{ backgroundColor: '#ec7393', color: 'white' }}
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
                                    modules={modules} // useMemo로 선언한 모듈 사용
                                    placeholder="내용을 입력하세요..."
                                    style={{ height: '200px', resize: 'vertical', overflowY: 'auto' }}
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
