import React, { useEffect, useState } from 'react'
import axios from "axios";
const Section = () => {
    const [data, setData] = useState([]); // State to hold the data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:3000/fetch-data");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    return (
        <section className="bgWhiteSec">
            <div className="container-fluid">
                <div className="row">
                    <nav className="tabNavSec">
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button
                                className="nav-link active"
                                id="gmass-nav-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#nav-home1"
                                type="button"
                                role="tab"
                                aria-controls="nav-home1"
                                aria-selected="true"
                            >
                                Current Campaigns
                            </button>
                            <button
                                className="nav-link"
                                id="gmass-nav-tab"
                                data-bs-toggle="tab"
                                data-bs-target="#nav-home2"
                                type="button"
                                role="tab"
                                aria-controls="nav-home2"
                                aria-selected="false"
                            >
                                Previous Campaigns
                            </button>
                        </div>
                    </nav>
                    <div className="linediverder">
                        <hr />
                    </div>
                    <div className="searchSec">
                        <div className="form-group has-search">
                            <span className="mdi mdi-magnify" />
                            <input type="text" className="form-control" placeholder="Search" />
                        </div>
                        <a
                            data-bs-toggle="offcanvas"
                            data-bs-target="#filterclick"
                            aria-controls="filterclick"
                            className="tbFilBtn"
                        >
                            <img
                                src="./assets/images/header/filter-list.svg"
                                alt=""
                                width={15}
                                height={10}
                            />
                            Filter
                        </a>
                        <a href="" className="tbFilBtn">
                            <img
                                src="./assets/images/refresh-icon.svg"
                                alt=""
                                width={14}
                                height={14}
                            />
                            Refresh
                        </a>
                    </div>
                    <div className="linediverder">
                        <hr />
                    </div>
                    <div className="tab-content" id="nav-tabContent">
                        <div
                            className="tab-pane fade show active"
                            id="nav-home1"
                            role="tabpanel"
                            aria-labelledby="gmass-nav-tab"
                            tabIndex={0}
                        >
                            {/* start Current campaign table  */}
                            <div
                                className="table-responsive table-container"
                                id="table-container"
                            >
                                <table className="table basic-border-table mb-0 table-hover">
                                    <thead>
                                        <tr>
                                            <th className="w30px dragablefalse" draggable="true">
                                                <input className="form-check-input" type="checkbox" />{" "}
                                            </th>
                                            {/* <th class="w30px dragablefalse" draggable="true"><label
                                          class="form-check-label">S.No.</label></th> */}
                                            <th>Subject Name</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Total Recipients</th>
                                            <th>No.of email send</th>
                                            <th>Opens</th>
                                            <th>Clicks</th>
                                            <th>Unsubscribed</th>
                                            <th>Bounces</th>
                                            <th>Replies</th>
                                            <th>Blocks</th>
                                            <th>Auto Follow-Up</th>
                                            <th>Sends Next</th>
                                            <th>Last Sent</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length > 0 ? (
                                            data.map((email, index) => (
                                                <tr key={index}>
                                                    <td draggable="false">
                                                        <input className="form-check-input" type="checkbox" />
                                                    </td>
                                                    <td>{email.subject}</td>
                                                    <td>{email.startDate || "N/A"}</td>
                                                    <td>{email.endDate || "N/A"}</td>
                                                    <td className="fw-bold text-center purpleText">
                                                        {email.totalRecipients || 0}
                                                    </td>
                                                    <td className="fw-bold text-center blueText">
                                                        {email.noOfEmailsSent || 0}
                                                    </td>
                                                    <td className="fw-bold text-center orangeText">{email.Opens || 0}</td> {/* Add Opens logic */}
                                                    <td className="fw-bold text-center greenText">N/A</td> {/* Add Clicks logic */}
                                                    <td className="fw-bold text-center skyBlueText">{email.unsubscribed || 0}</td> {/* Add Unsubscribed logic */}
                                                    <td className="fw-bold text-center purpleText">N/A</td> {/* Add Bounces logic */}
                                                    <td className="fw-bold text-center greenText">N/A</td> {/* Add Replies logic */}
                                                    <td className="fw-bold text-center redText">N/A</td> {/* Add Blocks logic */}
                                                    <td className="fw-bold text-center greenText">{email.followUp || "0"}</td> {/* Add Auto Follow-Up logic */}
                                                    <td className="text-center">N/A</td> {/* Add Sends Next logic */}
                                                    <td className="text-center">{email.lastSent || "N/A"}</td> {/* Add Last Sent logic */}
                                                    <td className="actionIconsSec">
                                                        <a href="" className="purplbg">
                                                            <img
                                                                src="./assets/images/header/graph-icon.svg"
                                                                alt="Graph"
                                                                width={20}
                                                                height="20px"
                                                            />
                                                        </a>
                                                        <a
                                                            href=""
                                                            className="purplbg"
                                                            data-bs-toggle="modal"
                                                            data-bs-target="#signGmass"
                                                        >
                                                            <img
                                                                src="./assets/images/header/eye-icon.svg"
                                                                alt="Eye"
                                                                width={20}
                                                                height="20px"
                                                            />
                                                        </a>
                                                        <a href="" className="redbg">
                                                            <img
                                                                src="./assets/images/header/play-icon.svg"
                                                                alt="Play"
                                                                width={20}
                                                                height="20px"
                                                            />
                                                        </a>
                                                        <a href="" className="redbg">
                                                            <img
                                                                src="./assets/images/header/delete-icon.svg"
                                                                alt="Delete"
                                                                width={20}
                                                                height="20px"
                                                            />
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="17" className="text-center">
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}

export default Section