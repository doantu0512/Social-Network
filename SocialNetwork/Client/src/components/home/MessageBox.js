import React, {Component, Fragment} from 'react';
import {requester, userService} from '../../infrastructure';
import {toast} from 'react-toastify';
import {ToastComponent} from '../common';
import FriendChatBox from './FriendChatBox';
import FriendMessage from './FriendMessage';
import '../user/css/UserAllPage.css';
import './css/MessageBox.css';
import {connect} from 'react-redux';
import {fetchAllChatFriendsAction, updateUserStatusAction} from '../../store/actions/userActions';
import {
    fetchAllMessagesAction,
    addMessageAction,
    fetchAllUnreadMessagesAction
} from '../../store/actions/messageActions';
import SendIcon from '@mui/icons-material/Send';
import Stomp from "stompjs";
import SockJS from "sockjs-client";
import {FileImageOutlined, PictureTwoTone, PlusOutlined, SendOutlined} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {Space} from "antd";
import {Modal, Upload} from 'antd';
import {IconButton} from "@mui/material";
import CollectionsIcon from '@mui/icons-material/Collections';
import placeholder_user_image from "../../assets/images/placeholder.png";

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

class MessageBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loggedInUserId: '',
            chatUserId: '',
            chatUserFirstName: '',
            chatUserLastName: '',
            chatUserNameFormatted: '',
            chatUserProfilePicUrl: '',
            userBoxHeight: 'toggle',
            chatBoxHeight: '',
            previewOpen: false,
            previewImage: '',
            previewTitle: '',
            fileList: [],
            chatBoxDisplay: 'display-none',
            content: '',
            shouldScrollDown: false,
            friendsArrLength: 0,
            clientConnected: false,
            isAddFile: false,
            touched: {
                content: false,
            }
        };

        this._isMounted = false;

        this.serverUrl = userService.getBaseUrl() + '/socket'
        this.stompClient = null;

        this.handleBlur = this.handleBlur.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
        this.showUserChatBox = this.showUserChatBox.bind(this);
        this.changeChatBoxDisplay = this.changeChatBoxDisplay.bind(this);
        this.getAllMessages = this.getAllMessages.bind(this);
        this.loadAllChatFriends = this.loadAllChatFriends.bind(this);
    }

    componentDidMount() {
        const userId = userService.getUserId();
        this.setState({
            loggedInUserId: userId,
        });

        this.initializeWebSocketConnection();
        this.loadAllChatFriends();

        this._isMounted = true;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.allMessagesArr !== prevProps.allMessagesArr) {
            this.setState({
                content: '',
            }, () => {
                if (this.state.shouldScrollDown) {
                    this.scrollDown();
                } else {
                    this.setState({shouldScrollDown: true}, this.scrollTop())
                }
            });
        }

        if (this.props.friendsChatArr.length !== prevProps.friendsChatArr.length) {
            this.setState({
                chatBoxDisplay: 'display-none'
            })
        }

        if (this.props.triggerMessageLoad !== prevProps.triggerMessageLoad) {
            const userData = this.props.triggerMessageLoad;
            this.showUserChatBox(userData)
        }

        const errorMessage = this.getErrorMessage(prevProps, prevState);
        const successMessage = this.getSuccessMessage(prevProps, prevState)

        if (errorMessage) {
            toast.error(<ToastComponent.errorToast text={errorMessage}/>, {
                position: toast.POSITION.TOP_RIGHT
            });
        } else if (successMessage) {
            toast.success(<ToastComponent.successToast text={successMessage}/>, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    }

    componentWillUnmount() {
        this.stompClient.disconnect();
        this._isMounted = false;
    }

    getSuccessMessage(prevProps, prevState) {
        if (!this.props.fetchAllChatFriends.hasError && this.props.fetchAllChatFriends.message && this.props.fetchAllChatFriends !== prevProps.fetchAllChatFriends) {
            return this.props.fetchAllChatFriends.message;
        } else if (!this.props.fetchAllMessages.hasError && this.props.fetchAllMessages.message && this.props.fetchAllMessages !== prevProps.fetchAllMessages) {
            return this.props.fetchAllMessages.message;
        }
        return null;
    }

    getErrorMessage(prevProps, prevState) {
        if (this.props.fetchAllChatFriends.hasError && prevProps.fetchAllChatFriends.error !== this.props.fetchAllChatFriends.error) {
            return this.props.fetchAllChatFriends.message || 'Server Error';
        } else if (this.props.fetchAllMessages.hasError && prevProps.fetchAllMessages.error !== this.props.fetchAllMessages.error) {
            return this.props.fetchAllMessages.message || 'Server Error';
        }

        return null;
    }

    initializeWebSocketConnection = () => {
        const ws = new SockJS(this.serverUrl);
        this.stompClient = Stomp.over(ws);
        const headers = this.getAuthHeader();

        this.stompClient.connect(headers, (frame) => {
            if (this._isMounted) {
                this.setState({clientConnected: true});
                this.stompClient.subscribe("/user/queue/position-update", (message) => {
                    if (message.body) {
                        const messageBody = JSON.parse(message.body);
                        if (this._isMounted && (messageBody.fromUserId === this.state.chatUserId || messageBody.fromUserId === userService.getUserId())) {
                            this.props.addMessage(messageBody)
                        }

                        if (messageBody.fromUserId !== userService.getUserId()) {
                            const formattedUserNames = userService.formatUsername(messageBody.fromUserFirstName, messageBody.fromUserLastName)

                            toast.info(<ToastComponent.infoToast
                                text={`You have a new message from ${formattedUserNames}!`}/>, {
                                position: toast.POSITION.TOP_RIGHT
                            });

                            if(this.state.chatBoxDisplay!==''){
                                const fromUser = this.props.friendsChatArr.find(user=>user.id===messageBody.fromUserId)
                                const { id, firstName, lastName , online} = fromUser;
                                this.showUserChatBox(fromUser)

                            }

                            this.props.loadAllUnreadMessages();
                        }
                    }
                });

                this.stompClient.subscribe("/chat/login", (message) => {
                    if (message.body) {
                        const parsedBody = JSON.parse(message.body);
                        this.changeUserOnlineStatus(parsedBody);
                    }
                });

                this.stompClient.subscribe("/chat/logout", (message) => {
                    if (message.body) {
                        const parsedBody = JSON.parse(message.body);
                        this.changeUserOnlineStatus(parsedBody);
                    }
                });
            }
        }, () => {
            toast.error(<ToastComponent.errorToast
                text={`Lost connection to ${this.serverUrl}. Refresh the page to reconnect.`}/>, {
                position: toast.POSITION.TOP_RIGHT
            });

            //// Callback for automatically reconnecting to the server
            // setTimeout(() => {
            //     toast.error(<ToastComponent.errorToast text={`Lost connection to ${this.serverUrl}. Trying to reconnect.`} />, {
            //         position: toast.POSITION.TOP_RIGHT
            //     });
            //     this.initializeWebSocketConnection();
            // }, 10000);
        });
    }

    sendMessage(payload) {
        this.stompClient.send("/app/message", {}, JSON.stringify(payload));
        this.setState({content: ''})
        this.setState({images: []})
        this.setState({fileList:[]})
    }

    sendImages(toUserId, images) {
        const FormData = require('form-data');
        let data = new FormData();
        images.forEach((value) => data.append('images', value))
        data.append('toUserId', toUserId);
        console.log(data)
        return requester.addPhoto('/message/images', data, (response) => {
            if (response.error) {
                const {error, message, status, path} = response;
            } else {
            }
        }).catch(err => {
            if (err.status === 403 && err.message === 'Your JWT token is expired. Please log in!') {
                localStorage.clear();
            }
        })

    }

    getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return (token && token.length)
            ? {'Authorization': `Bearer ${token}`}
            : {}
    }

    getAllMessages = (chatUserId) => {
        this.props.fetchAllMessages(chatUserId);
    }

    loadAllChatFriends = () => {
        const userId = userService.getUserId();
        this.props.loadAllChatFriends(userId);
    }

    onSubmitHandler() {

        const {chatUserId: toUserId, content, images} = this.state;

        if (this.state.clientConnected) {
            this.sendMessage({toUserId, content});
            if (images&&images.length > 0) {
                this.sendImages(toUserId, images)
            }
        } else {
            toast.error(<ToastComponent.errorToast text={`StompClient is disconnected`}/>, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
    }

    onChangeHandler(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleBlur = (field) => (event) => {
        this.setState({
            touched: {...this.state.touched, [field]: true}
        });
    }


    validate = (content) => {
        return {
            content: content.length === 0,
        }
    }

    handleCancel = () => {
        this.setState({previewOpen: false})
    }

    changeHeight = () => {
        const userBoxHeight = this.state.userBoxHeight;
        if (userBoxHeight === '') {
            this.setState({userBoxHeight: 'toggle'})
        } else {
            this.setState({userBoxHeight: ''})
        }
    }

    changeChatBoxHeight = () => {
        const chatBoxHeight = this.state.chatBoxHeight;
        if (chatBoxHeight === '') {
            this.setState({chatBoxHeight: 'toggle-chat-container'})
        } else {
            this.setState({chatBoxHeight: ''})
        }
    }

    changeChatBoxDisplay = () => {
        const chatBoxDisplay = this.state.chatBoxDisplay;
        if (chatBoxDisplay === '') {
            this.setState({chatBoxDisplay: 'display-none'})
        } else {
            this.setState({chatBoxDisplay: ''})
        }
    }

    showUserChatBox = (data, event) => {
        const {id, firstName, lastName, profilePicUrl} = data
        let chatUserNameFormatted = userService.formatUsername(firstName, lastName, 18)
        this.setState({
            chatUserId: id,
            chatUserFirstName: firstName,
            chatUserLastName: lastName,
            chatUserNameFormatted,
            chatUserProfilePicUrl: profilePicUrl,
            shouldScrollDown: true,
            chatBoxDisplay: '',
            chatBoxHeight: '',
            content: '',
        }, () => {
            this.getAllMessages(id);
        })
    }

    closeUserChatBox = () => {
        this.setState({chatBoxDisplay: 'display-none'})
    }

    scrollToBottom() {
        const e = document.getElementById('chat-content');
        e.scrollTop = e.scrollHeight - e.getBoundingClientRect().height;
    }

    scrollTop() {
        const container = document.getElementById('chat-content');
        container.scrollTop = 0;
    }

    scrollDown() {
        const container = document.getElementById('chat-content');
        container.scrollTop = container.scrollHeight
    }

    getOnlineUserCount = () => {
        let usersCount = this.props.friendsChatArr.filter(user => {
            return user.online === true
        });
        return usersCount.length;
    }

    changeUserOnlineStatus(webSocketMessage) {
        const {userId: id, online} = webSocketMessage;
        this.props.updateUserStatus({id, online});
    }

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({previewImage: (file.url || file.preview)});
        this.setState({previewOpen: true})
        this.setState({previewTitle: (file.name || file.url.substring(file.url.lastIndexOf('/') + 1))});
    };
    handleChange = ({fileList: newFileList}) => {
        this.setState({fileList: (newFileList)})
        this.setState({images: [...(newFileList.map(value => value.originFileObj))]})
        console.log("new file list", newFileList)
    };

    handleClickChangeAddFile = () => {
        this.setState({isAddFile: !this.state.isAddFile})
    }

    render() {
        if (!this.state.clientConnected) {
            console.log('Connecting...')
            return <h1 className="text-center pt-5 mt-5">Connecting...</h1>
        }

        const {content} = this.state;
        const errors = this.validate(content);
        const isEnabled = !Object.keys(errors).some(x => errors[x]);
        const loggedInUserFirstName = userService.getFirstName();
        const userBoxHeight = this.state.userBoxHeight;
        const chatBoxHeight = this.state.chatBoxHeight;
        const chatBoxDisplay = this.state.chatBoxDisplay;

        const {chatUserProfilePicUrl, chatUserNameFormatted} = this.state;
        const imageClassUserPick = userService.getImageSize(chatUserProfilePicUrl);
        const firstNameFormatted = userService.formatUsername(loggedInUserFirstName);

        return (
            <Fragment>
                <section className={`messagebox-container ${userBoxHeight}`}>
                    <div className="messagebox-header" onClick={this.changeHeight}>
                        <div className="messagebox-chat-icon">
                            <i className="fas fa-location-arrow"></i>
                        </div>
                        <h4 className="chat-title" style={{color: ' #333'}}>
                            Chat &bull; {this.getOnlineUserCount()}
                        </h4>
                    </div>
                    <div className="messagebox-friendsChatArr-wrapper">

                        {this.props.friendsChatArr.map((friend) =>
                            <FriendChatBox
                                key={friend.id}
                                showUserChatBox={this.showUserChatBox}
                                {...friend}
                            />
                        )}
                        {console.log("this.props.friendsChatArr==============",this.props.friendsChatArr)}
                    </div>
                </section>
                <section className={`chat-container ${chatBoxHeight} ${chatBoxDisplay}`} id="chat-container">
                    <div className="chat-friend-container" onClick={this.changeChatBoxHeight}>
                        <div className="chat-friend-image">
                            <img className={imageClassUserPick} src={chatUserProfilePicUrl} alt="bender"/>
                        </div>
                        <div className="chat-username-container">
                            <p className="chat-username">{chatUserNameFormatted}</p>
                        </div>
                    </div>

                    <div className="close-button-container" onClick={this.closeUserChatBox}>
                        <div className="btn chat-uiButtonGroup chat-fbPhotoCurationControl  chat-delete-button"><i
                            className="fas fa-times"></i></div>
                    </div>

                    <div className="content-wrapper">

                        <div className="chat-content" id="chat-content">
                            {this.props.allMessagesArr.map((message) =>
                                <FriendMessage
                                    key={message.id}
                                    {...message}
                                />
                            )}
                        </div>
                        <div className="chat-footer">
                            <div className="chat-input-group">
                                <div className="chat-area-container">

                                    <Space align="end">
                                        <IconButton color="secondary" onClick={this.handleClickChangeAddFile}>
                                            <CollectionsIcon/>
                                        </IconButton>

                                        <div className={this.state.isAddFile ? "mess-content" : ""}>
                                            {this.state.isAddFile && <Upload className="p-2 scrollX"
                                                                             action="greeting"
                                                                             multiple={true}
                                                                             customRequest={({file, onSuccess}) => {
                                                                                 setTimeout(() => {
                                                                                     onSuccess("ok");
                                                                                 }, 0);
                                                                             }}
                                                                             showUploadList={true}
                                                                             listType="picture-card"
                                                                             fileList={this.state.fileList}
                                                                             onPreview={this.handlePreview}
                                                                             onChange={this.handleChange}
                                            >
                                                <PlusOutlined/> đính kèm ảnh
                                            </Upload>}
                                            <TextArea
                                                style={{backgroundColor: "red"}}
                                                onBlur={this.handleBlur('content')}
                                                name="content"
                                                id="content"
                                                value={this.state.content}
                                                onChange={this.onChangeHandler}
                                                placeholder="Aa"
                                                autoSize={{minRows: 1, maxRows: 3}}
                                                size="large"
                                                style={{width: "20rem", minHeight: "40px !important"}}
                                            />

                                        </div>
                                        <IconButton aria-label="fingerprint" color="primary"
                                                    onClick={this.onSubmitHandler}
                                                    disabled={!(this.state.content.length !== 0 || this.state.images)}>
                                            <SendIcon/>
                                        </IconButton>


                                    </Space>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Modal open={this.state.previewOpen} title={this.state.previewTitle} footer={null}
                           onCancel={this.handleCancel}>
                        <img alt="example" style={{width: '100%'}} src={this.state.previewImage}/>
                    </Modal>
                </section>
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        friendsChatArr: state.fetchAllChatFriends.friendsChatArr,
        fetchAllChatFriends: state.fetchAllChatFriends,

        allMessagesArr: state.fetchAllMessages.allMessagesArr,
        fetchAllMessages: state.fetchAllMessages,

        triggerMessageLoad: state.triggerMessageLoad,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        loadAllChatFriends: (userId) => {
            dispatch(fetchAllChatFriendsAction(userId))
        },
        fetchAllMessages: (chatUserId) => {
            dispatch(fetchAllMessagesAction(chatUserId))
        },
        updateUserStatus: (userData) => {
            dispatch(updateUserStatusAction(userData))
        },
        addMessage: (messageBody) => {
            dispatch(addMessageAction(messageBody))
        },
        loadAllUnreadMessages: () => {
            dispatch(fetchAllUnreadMessagesAction())
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageBox);