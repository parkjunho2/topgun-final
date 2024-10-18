import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";


const Flight = () => {
    const [flightList, setFlightList] = useState([]);

    const [input, setInput] = useState({
        flightNumber: "",
        departureAirport: "",
        arrivalAirport: "",
        departureTime: "",
        arrivalTime: "",
        flightTotalSeat: "",
        flightStatus: "대기", // Default status
    });

    useEffect(() => {
        loadList();
    }, []);

    const loadList = useCallback (() => {
        axios({
            url:"http://localhost:8080/flight/",
            method:"get"
        }) 
        .then(resp=>{
            //console.log(resp);
            setFlightList(resp.data);
        });
    },[flightList]);


    const deleteFlight = useCallback((target) => {
        //확인창 추가
        const choice = window.confirm("정말 삭제하시겠습니까?");
         axios({
             url:"http://localhost:8080/flight/"+target.flight_id,
             method:"delete"
         })
         .then(resp=>{
             loadList();//목록갱신
         });
     }, [flightList]);

     const changeInput = useCallback(e=>{
        setInput({
            ...input,
            [e.target.name] : e.target.value
        });
    }, [input]);

    const addInput = useCallback(()=>{
        axios({
            url:"http://localhost:8080/flight/",
            method:"post",
            data: input
        })
        .then(resp=>{
            clearInput();//입력창 초기화
            loadList();//목록 다시 불러오기
        });
    }, [input]);

    const clearInput = useCallback(() => {
        setInput({
            flightNumber: "",
            departureAirport: "",
            arrivalAirport: "",
            departureTime: "",
            arrivalTime: "",
            flightTotalSeat: "",
            flightStatus: "대기", //default
        });
    }, [input]);

    //view
    return (<>
    
        <div className="row mt-4">
            <div className="col">
                <table className="table table-striped">
                    <thead className="table-dark">
                        <tr> 
                            <th>항공편 번호</th>
                            <th>출발 공항</th>
                            <th>도착 공항</th>
                            <th>출발 시간</th>
                            <th>도착 시간</th>
                            <th>총 좌석 수</th>
                            <th>상태</th>
                            <th>메뉴</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flightList.map((flight) => (
                            <tr key={flight.flight_id}>
                                <td>{flight.flightNumber}</td>
                                <td>{flight.departureAirport}</td>
                                <td>{flight.arrivalAirport}</td>
                                <td>{flight.departureTime}</td>
                                <td>{flight.arrivalTime}</td>
                                <td>{flight.flightTotalSeat}</td>
                                <td>{flight.flightStatus}</td>
                                <td>
                                    <FaTrash className="text-danger" onClick={() => deleteFlight(flight)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="항공편 번호"
                                       name="flightNumber"
                                       value={input.flightNumber}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="출발 공항"
                                       name="departureAirport"
                                       value={input.departureAirport}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="text" className="form-control"
                                       placeholder="도착 공항"
                                       name="arrivalAirport"
                                       value={input.arrivalAirport}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="datetime-local" className="form-control"
                                       name="departureTime"
                                       value={input.departureTime}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="datetime-local" className="form-control"
                                       name="arrivalTime"
                                       value={input.arrivalTime}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <input type="number" className="form-control"
                                       placeholder="총 좌석 수"
                                       name="flightTotalSeat"
                                       value={input.flightTotalSeat}
                                       onChange={changeInput} />
                            </td>
                            <td>
                                <span className="badge bg-secondary">대기</span>
                            </td>
                            <td>
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
         </>);
};

export default Flight;
