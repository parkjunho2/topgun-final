import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import './Room.css'; // CSS 파일 import

const Room = ()=>{
    //navigator
    const navigate = useNavigate();

    //state
    const [roomList, setRoomList] = useState([]);
    
    //effect
    useEffect(()=>{
        loadRoomList();
    },[]);

    //callback
    const loadRoomList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/room/");
        console.log(resp);
        setRoomList(resp.data);
    },[roomList]);

    const enterRoom = useCallback(async (target)=>{
        if(target.join === 'Y'){
            navigate("/chat/"+target.roomNo); //이미 참여중인 방으로 이동
        }
        else{
            await axios.post("http://localhost:8080/room/enter", {roomNo : target.roomNo});
            loadRoomList();
            navigate("/chat/"+target.roomNo);
        }
    },[roomList]);

    return(<>
        {/* 방 목록 */}
        <div className="row mt-4">
            <div className="col">
                <div className="list-group">
                    {roomList.map(room=>(
                        <li className="list-group-item" key={room.roomNo}>
                            <h5 className="cusor" onClick={e=>enterRoom(room)}>{room.roomName}</h5>
                        </li>
                    ))}
                </div>
            </div>
        </div>
    </>);
};

export default Room;