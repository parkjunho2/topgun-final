import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill"; // Quill 에디터 임포트
import "react-quill/dist/quill.snow.css"; // 기본 스타일 임포트

const NoticeDetail = () => {
    const { noticeId } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedNotice, setUpdatedNotice] = useState({
        title: '',
        content: '',
        author: '',
        createdAt: ''
    });

    // Quill 참조
    const quillRef = useRef(null);

    useEffect(() => {
        const loadNotice = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notice/${noticeId}`);
                setNotice(response.data);
                setUpdatedNotice({
                    title: response.data.title,
                    content: response.data.content,
                    author: response.data.author,
                    createdAt: response.data.createdAt
                });
            } catch (error) {
                console.error("Failed to load notice:", error);
            }
        };
        loadNotice();
    }, [noticeId]);

    const handleUpdate = async () => {
        const content = quillRef.current.getEditor().root.innerHTML; // Quill 에디터에서 HTML 가져오기
        try {
            await axios.put(`http://localhost:8080/notice/`, { ...updatedNotice, content, noticeId });
            alert('공지사항이 수정되었습니다!'); // 알림 발동
            navigate(`/notice/${noticeId}`); // 수정 후 상세 페이지로 이동
        } catch (error) {
            console.error("Failed to update notice:", error);
            alert('수정 실패. 다시 시도해 주세요.');
        }
    };

    if (!notice) return <div>Loading...</div>;

    return (
        <div style={styles.container}>
            {isEditing ? (
                <div style={styles.editMode}>
                    <h1 style={styles.title}>NOTICE EDIT</h1>
                    <input
                        type="text"
                        style={styles.titleInput}
                        value={updatedNotice.title}
                        onChange={(e) => setUpdatedNotice({ ...updatedNotice, title: e.target.value })}
                        placeholder="제목을 입력하세요"
                    />
                    <ReactQuill 
                        ref={quillRef} // Quill 참조 설정
                        value={updatedNotice.content}
                        onChange={(content) => setUpdatedNotice({ ...updatedNotice, content })} // 퀼 에디터의 내용 업데이트
                        style={styles.quillEditor}
                    />
                </div>
            ) : (
                <div style={styles.viewMode}>
                    <h1 style={styles.title}>{notice.title}</h1>
                    <hr style={styles.divider} /> {/* 구분선 추가 */}
                    <h4>작성자: {notice.author}</h4>
                    <p>작성일: {notice.createdAt}</p>
                    <div style={styles.noticeContent}>
                        <ReactQuill 
                            value={notice.content} // Quill을 사용하여 내용 표시
                            readOnly={true} // 읽기 전용 모드
                            theme="bubble" // 기본 스타일 대신 "bubble" 테마 사용
                        />
                    </div>
                </div>
            )}
            {/* 버튼들을 에디터 밖으로 이동 */}
            <div style={styles.buttonContainer}>
                {isEditing ? (
                    <>
                        <button style={styles.primaryButton} onClick={handleUpdate}>수정하기</button>
                        <button style={styles.secondaryButton} onClick={() => setIsEditing(false)}>취소하기</button>
                    </>
                ) : (
                    <button style={styles.editButton} onClick={() => setIsEditing(true)}>수정하기</button>
                )}
            </div>
        </div>
    );
};

// 스타일 객체
const styles = {
    container: {
        maxWidth: '800px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'transparent',
        position: 'relative', // 위치 조정을 위해 relative로 설정
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    titleInput: {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        border: 'none', // 테두리 없애기
        borderRadius: '4px',
        fontSize: '16px',
        backgroundColor: '#f5f5f5', // 배경색 추가
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end', // 버튼들을 오른쪽으로 정렬
        position: 'absolute', // 버튼 컨테이너를 절대 위치로 설정
        top: '20px', // 선과 겹치지 않도록 위치 조정
        right: '20px', // 오른쪽으로 조정
        marginTop: '0', // 상단 마진 제거
        marginBottom: '0', // 하단 마진 제거
    },
    primaryButton: {
        padding: '8px 8px',
        border: 'none', // 테두리 없애기
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#ec7393', // 분홍색 버튼
        color: 'white',
        marginRight: '10px', // 버튼 간격 조정
    },
    secondaryButton: {
        padding: '8px 8px',
        border: 'none', // 테두리 없애기
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#ccc', // 취소 버튼 색상
        color: 'black',
    },
    editButton: {
        marginTop:'25px',
        padding: '8px 8px',
        borderRadius: '4px',
        border: 'none', // 테두리 없애기
        cursor: 'pointer',
        margin: '10px',
        backgroundColor: '#ec7393', // 분홍색 버튼
        color: 'white',
    },
    noticeContent: {
        margin: '20px 0',
        lineHeight: '13',
    },
    editMode: {
        marginTop: '20px',
    },
    viewMode: {
        marginTop: '20px',
    },
    quillEditor: {
        height: '500px', // 높이를 500px로 설정
        marginBottom: '40px', // 에디터 아래쪽 마진 조정
    },
    divider: {
        border: '1px solid #ccc', // 구분선 색상
        margin: '20px 0',
    },
};

export default NoticeDetail;
