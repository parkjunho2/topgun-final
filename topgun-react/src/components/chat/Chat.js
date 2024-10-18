import { useCallback, useEffect, useRef, useState } from "react";
import './Chat.css'; // CSS 파일 임포트
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import "moment/locale/ko";//moment 한국어 정보 불러오기

const Chat = () => {
    const navigate = useNavigate();
    const {roomNo} = useParams();

    //state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);    
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);

    //recoil   
    const user = useRecoilValue(userState);
    const login = useRecoilValue(loginState);
    const memberLoading = useRecoilValue(memberLoadingState);
    
    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken") 
                                    || window.sessionStorage.getItem("refreshToken");

    //effect
    const location = useLocation();
    useEffect(()=>{
        if(memberLoading === false)  return;

        // const canEnter = checkRoom();

        const client = connectToServer();
        setClient(client);
        return()=>{
            disconnectFromServer(client);
        }
    },[location.pathname, memberLoading]);

    //callback
    const connectToServer = useCallback(()=>{
        const socket = new SockJS("http://localhost:8080/ws");

        const client = new Client({
            webSocketFactory : ()=> socket,
            connectHeaders : {
                accessToken : accessToken,
                refreshToken : refreshToken,
            },
            onConnect : () => {
                setClient(client);
                //채널 구독 처리
                client.subscribe("http://localhost:8080/private/chat/" + roomNo, (message) => {
                    const data = JSON.parse(message.body);
                    setMessageList(prev=>[...prev, data]); //새 메세지를 list에 추가
                    console.log(data);
                });
                // client.subscribe("http://localhost:8080/private/db/" + roomNo + "/" + user.userId,(message)=>{
                //     const data = JSON.parse(message.body);
                //     setMessageList(data.messageList);
                // });
                setConnect(true); //연결상태 갱신
            },
            onDisconnect : ()=> {
                setConnect(false); //연결상태 갱신
            }, 
            debug : (str) => {
                console.log(str);
            }
        });
        client.activate();
        return client;
    },[memberLoading]);

    const disconnectFromServer = useCallback((client)=>{
        if(client){
            client.deactivate();
        }
    },[]);

    const sendMessage = useCallback(()=>{
        // console.log(client);
        if(client === null) return;
        if(connect === false) return;
        if(input.length === 0) return;

        client.publish({
            destination : "/app/room/"+roomNo,
            headers : {
                accessToken : accessToken,
                refreshToken : refreshToken
            },
            body : JSON.stringify( {content : input} )
        });
         // 메시지를 전송한 후 상태에 추가
        const newMessage = {
            type: "chat",
            senderMemberId: user.userId,
            content: input,
            time: new Date().toISOString(), // 현재 시간
        };
        setMessageList(prev => [...prev, newMessage]); // 로컬에서 바로 추가
        setInput(""); // 입력창 초기화
    },[input, client, connect]);

    const [isTyping, setIsTyping] = useState(false); // 입력 중인지 여부

    // 메시지 목록 끝에 대한 ref 추가
    const messagesEndRef = useRef(null);

    // 메시지 목록 업데이트 시 자동 스크롤
    useEffect(() => {
        if (!isTyping) {    // 입력 중이 아닐 때만 스크롤
            scrollToBottom();
        }
    }, [messageList, isTyping]);

    // 자동 스크롤 함수
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // 부드럽게 스크롤
        }
    };

    // console.log("메세지리스트", setMessageList);

    return (<>
        <h3>{"현재 연결 상태 = " + (connect ? "연결됨" : "종료됨")}</h3>
         <div className="row mt-4">
            {/* 사용자 목록 */}
            {/* <div className="col-3">
                <h4 className="text-center">접속자</h4>
                <ul className="list-group">
                    {userList.map((user, index) => (
                        <li className="list-group-item" key={index}>
                            {user === memberId ? user + "(나)" : user}
                        </li>
                    ))}
                </ul>
            </div> */}

            {/* 메세지 목록 */}
            <div className="col">
                {/* 더보기 버튼(firstMessageNo가 null이 아니면) */}
                {/* {more === true && (
                    <button className="btn btn-outline-success w-100" onClick={loadMoreMessageList}>
                        더보기
                    </button>
                )} */}
                <div className="chat-container mt-3">
                    <ul className="list-group">
                        {messageList.map((message, index) => (
                            <li className="list-group-item" key={index}>
                                {/* 일반 채팅일 경우(type === chat) */}
                                {message.type === "chat" && (
                                    <div className={`chat-message ${login && user.userId === message.senderUsersId ? "my-message" : "other-message"}`}>
                                        <div className="chat-bubble">
                                            {/* 발신자 정보 */}
                                            {login && user.userId !== message.senderUsersId && (
                                                <div className="message-header">
                                                    <h5>
                                                        {message.senderUsersId}
                                                        <small className="text-muted"> ({message.senderUsersType})</small>
                                                    </h5>
                                                </div>
                                            )}
                                            <p className="message-content">{message.content}</p>
                                            <p className="text-muted message-time">{moment(message.time).format("a h:mm")}</p>
                                        </div>
                                    </div>
                                )}
                                {/* {message.type === "dm" && (
                                    <div className={`chat-message ${login && user.userId === message.senderMemberId ? "my-message" : "other-message"}`}>
                                        <div className="chat-bubble">
                                            수신자일 경우 ooo님으로부터 온 메세지 형태로 출력
                                            {(user.userId === message.receiverMemberId) && (
                                                <div className="message-header">
                                                    <p className="text-danger">
                                                        {message.senderMemberId} 님으로부터 온 메세지
                                                    </p>
                                                </div>
                                            )}
                                            발신자일 경우 ooo님에게 보낸 메세지 형태로 출력
                                            {(user.userId === message.senderMemberId) && (
                                                <div className="message-header">
                                                    <p className="text-danger">
                                                        {message.receiverMemberId} 님에게 보낸 메세지
                                                    </p>
                                                </div>
                                            )}
                                            사용자가 보낸 메세지 본문
                                            <p className="message-content">{message.content}</p>
                                            <p className="text-muted message-time">{moment(message.time).format("a h:mm")}</p>
                                        </div>
                                    </div>
                                )} */}
                            </li>
                        ))}
                    </ul>
                    {/* 입력창 */}
                    <div className="row mt-4">
                        <div className='col'>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                    value={input} onChange={e => setInput(e.target.value)}
                                    onKeyUp={e => {
                                        if (e.key === 'Enter' && login) {
                                            sendMessage();
                                        }
                                    }} disabled={login === false} />
                                <button className="btn btn-success" disabled={login === false}
                                    onClick={sendMessage}>보내기</button>
                            </div>
                        </div>
                    </div>
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    </>);
};

export default Chat;