import { useLocation, useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useState, useRef } from "react";
import { useLinkClickHandler } from "react-router-dom";
import { loginState, memberLoadingState, userState } from "../../util/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";//moment 한국어 정보 불러오기
import './Chat.css'; // CSS 파일 임포트

const Chat = () => {
    //방번호
    const { roomNo } = useParams();
    const navigate = useNavigate();

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

        const canEnter = checkRoom();

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
                console.log("WebSocket Connected");
                setClient(client);
                //채널 구독 처리
                client.subscribe("/private/chat/" + roomNo, (message) => {
                    const data = JSON.parse(message.body);
                    setMessageList(prev=>[...prev, data]); //새 메세지를 list에 추가
                    // console.log(data);
                });
                client.subscribe("/private/db/" + roomNo + "/" + user.userId,(message)=>{
                    const data = JSON.parse(message.body);
                    if (data && Array.isArray(data.messageList)) {
                        setMessageList(data.messageList);
                        console.log("Updated message list:", data.messageList); // 상태 업데이트 확인
                    }
                    // setMessageList(data.messageList);
                });
                setConnect(true); //연결상태 갱신
            },
            onDisconnect : ()=> {
                console.log("WebSocket Disconnected");
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
        console.log("Sending message:", input);
        client.publish({
            destination : "/app/room/" + roomNo,
            headers : {
                accessToken : accessToken,
                refreshToken : refreshToken
            },
            body : JSON.stringify( {content : input} )
        });
        //  메시지를 전송한 후 상태에 추가
        // const newMessage = {
        //     type: "chat",
        //     senderUsersId: user.userId,
        //     content: input,
        //     time: new Date().toISOString(), // 현재 시간
        // };
        // setMessageList(prev => [...prev, newMessage]); // 로컬에서 바로 추가
        setInput(""); // 입력창 초기화
    },[input, client, connect]);

    const checkRoom = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/room/check/" + roomNo);
        if(resp.data === false){
            navigate("/room", {replace : true});
        }
    },[roomNo]);

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

    return (<>
        {/* <h3>{"현재 연결 상태 = " + (connect ? "연결됨" : "종료됨")}</h3> */}
         <div className="row mt-4">
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
                    {/* <div ref={messagesEndRef} /> */}
                </div>
            </div>
        </div>
    </>);
};

export default Chat;