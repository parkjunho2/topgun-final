
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Jumbotron from './../Jumbotron';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { IoIosSend } from "react-icons/io";

import moment from "moment";
import "moment/locale/ko";//moment 한국어 정보 불러오기
import { useRecoilValue } from "recoil";
import { loginState, memberIdState, memberLevelState, memberLoadingState } from "../../utils/recoil";
import axios from "axios";
import { json, useLocation } from "react-router";
moment.locale("ko");//moment에 한국어를 기본 언어로 설정

const WebSocketClient = () => {
    //state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [userList, setUserList] = useState([]);

    const [client, setClient] = useState(null);//웹소켓 통신 도구
    const [connect, setConnect] = useState(false);//연결 상태

    const firstMessageNo = useMemo(()=>{
        if(messageList.length === 0) return false; //메세지 없음(첫메세지도 없음)
        //제일 앞 메세지의 no를 조사
        const message = messageList[0];
        return message.no || null; //메세지 번호 반환 or 없으면 null
    },[messageList]);

    const [more, setMore] = useState(false);

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLevel = useRecoilValue(memberLevelState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
        || window.sessionStorage.getItem("refreshToken");

    //effect
    //- (문제상황) 종료가 아예 이루어지지 않음
    //- 연결은 최초 1회만 되어야 하므로 연관항목은 비어 있어야 한다
    //- disconnectFromServer에서 client가 필요하기 때문에 전달해야함
    //- connectToServer에서 반환한 결과를 disconnectFromServer의 인자로 전달
    //- (문제상황) 새로고침은 잘 적용이 되지만 다른페이지를 갈 경우 처리가 안됨
    //- 주소에 영향을 받아서 effect가 실행되도록 재구성 (useLocation)
    const location = useLocation();
    useEffect(() => { //주소 변경시
        //회원 로그인이 완료되지 않았다면 중단
        if (memberLoading === false) return;

        const client = connectToServer();
        return () => {
            disconnectFromServer(client);
        };
    }, [location.pathname, memberLoading]);

    //callback
    //- 웹소켓 연결 기능
    const connectToServer = useCallback(() => {
        //소켓 생성(연결)
        const socket = new SockJS("http://localhost:8080/ws");

        //stomp에 맞게 개조(재해석)
        const client = new Client({
            //사용할 소켓을 지정
            webSocketFactory: () => socket,
            //연결되었을 때 할 일을 지정 - 채널 구독 설정
            onConnect: () => {
                //client.subscribe("구독할주소", 메세지오면 처리할 함수);
                client.subscribe("http://localhost:8080/public/chat", (message) => {
                    const json = JSON.parse(message.body);
                    //추가 편집 작업(필요하다면)
                    setMessageList(prev => [...prev, json]);//순서 보장
                });
                client.subscribe("http://localhost:8080/public/users", (message) => {
                    const json = JSON.parse(message.body);
                    setUserList(json);
                });
                //로그인 한 사람만 DM을 받을 수 있는 채널을 구독하도록 구현
                if (login === true) { //회원
                    client.subscribe("http://localhost:8080/public/dm/" + memberId, (message) => {
                        const json = JSON.parse(message.body);
                        setMessageList(prev => [...prev, json]);//순서 보장
                    });
                    client.subscribe("http://localhost:8080/public/db/" + memberId, (message) => {
                        const json = JSON.parse(message.body);
                        setMessageList(json.messageList);//덮어쓰기
                        setMore(json.last === false); //더보기 여부 설정
                    });
                }
                else{ //비회원
                    client.subscribe("http://localhost:8080/public/db/", (message) => {
                        const json = JSON.parse(message.body);
                        setMessageList(json.messageList);//덮어쓰기
                        setMore(json.last === false); //더보기 여부 설정
                    });
                }

                setConnect(true);
            },
            //연결 종료되었을 때 할 일을 지정
            onDisconnect: () => {
                setConnect(false);
            },
            // 진행상황에 대한 메세지를 처리할 방법을 지정
            debug: (str) => {
                console.log("[DEBUG] " + str);
            }
        });

        //(+추가) 로그인이 되어 있는 상태라면 웹소켓 연결시에 헤더를 추가
        if (login === true) {
            client.connectHeaders = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }

        //client 활성화
        client.activate();

        //client를 react state에 설정
        setClient(client);

        return client;
    }, [memberLoading]);
    //- 웹소켓 연결 해제 기능
    const disconnectFromServer = useCallback((client) => {
        if (client) {
            client.deactivate();
        }
    }, [11]);

    //메세지 전송 함수
    const sendMessage = useCallback(() => {
        //차단 조건들
        if (client === null) return; //소켓 클라이언트 미생성 시 차단
        if (connect === false) return; //연결이 안 된 경우 차단
        if (input.length === 0) return; //입력값이 없는 경우 차단

        //DM 발송 조건 - '/w', '/ㅈ'로 시작할 것
        if (input.startsWith("/w ") || input.startsWith("/ㅈ ")) {
            sendDM();
            return;
        }

        //전송 코드
        const json = {
            content: input
        };
        const message = {
            destination: "http://localhost:8080/app/chat",//보내는 목적지(서버의 설정에 따름)
            body: JSON.stringify(json),//JSON 문자열로 전송
        }
        //(+추가) 로그인 된 경우 메세지에 헤더를 추가
        if (login === true) {
            message.headers = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }
        client.publish(message);
        setInput("");
    }, [input, client, connect]);

    const sendDM = useCallback(() => {
        if (login === false) return;//비로그인 상태면 금지
        //DM을 위해 사용한 두글자와 띄어쓰기 제거(총 3글자)
        const convertStr = input.substring(3);
        const firstSpace = convertStr.indexOf(" ");
        const receiverId = convertStr.substring(0, firstSpace);//아이디
        const content = convertStr.substring(firstSpace + 1);//보낼 내용

        //전송 코드
        const json = {
            content: content
        };
        const message = {
            destination: "http://localhost:8080/app/dm/" + receiverId,//보내는 목적지(서버의 설정에 따름)
            body: JSON.stringify(json),//JSON 문자열로 전송
            headers: {
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        }
        client.publish(message);
        setInput("");
    }, [input, client, connect]);

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

    //'비동기'로 더보기 기능 구현
    //- 회원이면 이 요청의 헤더에 Authorization이 포함
    //- 비회원이면 이 요청의 헤더에 Authorization이 포함되지 않는다
    const loadMoreMessageList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/message/more/"+firstMessageNo);
        setMessageList(prev=>[...resp.data.messageList, ...prev]);
        setMore(resp.data.last === false);//더보기 여부 설정
    },[messageList, firstMessageNo, more]);

    //view
    return (<>
        <Jumbotron title="웹소켓 클라이언트" content={"현재 연결 상태 = " + (connect ? "연결됨" : "종료됨")} />

        <div className="row mt-4">
            {/* 사용자 목록 */}
            <div className="col-3">
                <h4 className="text-center">접속자</h4>
                <ul className="list-group">
                    {userList.map((user, index) => (
                        <li className="list-group-item" key={index}>
                            {user === memberId ? user + "(나)" : user}
                        </li>
                    ))}
                </ul>
            </div>

            {/* 메세지 목록 */}
            <div className="col-9">
                {/* 더보기 버튼(firstMessageNo가 null이 아니면) */}
                {more === true && (
                    <button className="btn btn-outline-success w-100" onClick={loadMoreMessageList}>
                        더보기
                    </button>
                )}
                <div className="chat-container mt-3">
                    <ul className="list-group">
                        {messageList.map((message, index) => (
                            <li className="list-group-item" key={index}>
                                {/* 일반 채팅일 경우(type === chat) */}
                                {message.type === "chat" && (
                                    <div className={`chat-message ${login && memberId === message.senderMemberId ? "my-message" : "other-message"}`}>
                                        <div className="chat-bubble">
                                            {/* 발신자 정보 */}
                                            {login && memberId !== message.senderMemberId && (
                                                <div className="message-header">
                                                    <h5>
                                                        {message.senderMemberId}
                                                        <small className="text-muted"> ({message.senderMemberLevel})</small>
                                                    </h5>
                                                </div>
                                            )}
                                            <p className="message-content">{message.content}</p>
                                            <p className="text-muted message-time">{moment(message.time).format("a h:mm")}</p>
                                        </div>
                                    </div>
                                )}
                                {message.type === "dm" && (
                                    <div className={`chat-message ${login && memberId === message.senderMemberId ? "my-message" : "other-message"}`}>
                                        <div className="chat-bubble">
                                            {/* 수신자일 경우 ooo님으로부터 온 메세지 형태로 출력 */}
                                            {(memberId === message.receiverMemberId) && (
                                                <div className="message-header">
                                                    <p className="text-danger">
                                                        {message.senderMemberId} 님으로부터 온 메세지
                                                    </p>
                                                </div>
                                            )}
                                            {/* 발신자일 경우 ooo님에게 보낸 메세지 형태로 출력 */}
                                            {(memberId === message.senderMemberId) && (
                                                <div className="message-header">
                                                    <p className="text-danger">
                                                        {message.receiverMemberId} 님에게 보낸 메세지
                                                    </p>
                                                </div>
                                            )}
                                            {/* 사용자가 보낸 메세지 본문 */}
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
                                    onClick={sendMessage}>
                                    <IoIosSend />보내기</button>
                            </div>
                        </div>
                    </div>
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    </>);
};

export default WebSocketClient;