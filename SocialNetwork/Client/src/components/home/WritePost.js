import React, { Fragment, Component } from 'react';
import { userService } from '../../infrastructure';
import {Button, Input, Modal} from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;

const { TextArea } = Input;

const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });



export default class WritePost extends Component {
    constructor(props) {
        super(props)

        this.state = {
            content: '',
            imageUrl: '',
            createPostData: '',
            images:[],
            isShowModal:false,
            previewOpen:false,
            previewImage:'',
            previewTitle:'',
            fileList:[],
            touched: {
                content: false,
            }
        };

        this.handleBlur = this.handleBlur.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const loading = this.props.createPostData.loading || this.props.loadingAllPosts;

        if (!loading && this.state.createPostData !== this.props.createPostData) {
            this.setState({
                content: '',
                images: [],
                previewImage:'',
                previewTitle:'',
                fileList:[],
                isShowModal:false,
                previewOpen:false,
                createPostData: this.props.createPostData,
            })
        }
    }

    changeUserData = (userdata) => {
        this.setState({loggedInUserProfilePicUrl: userdata.profilePicUrl})
    }

    onSelectFile = (e)=>{

        if (!e.target.files || e.target.files.length === 0) {

            return
        }
            this.setState({images:[...this.state.images,...e.target.files]})
        console.log(this.state.images)
    }

    handleCancel = () => this.setState({previewOpen:false});

    handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        this.setState({previewImage :(file.url || file.preview)});
        this.setState({previewOpen:true})
        this.setState({previewTitle :(file.name || file.url.substring(file.url.lastIndexOf('/') + 1))});
    };
    handleChange = ({ fileList: newFileList }) => {
        this.setState({fileList:(newFileList)})
        this.setState({images:[...(newFileList.map(value=>value.originFileObj))]})
        console.log("new file list",newFileList)
    };

    onSubmitHandler() {
        if (!this.canBeSubmitted()) {
            return;
        }

        const { content, images } = this.state;
        this.props.createPost(content, images);
    }

    onChangeHandler(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleBlur = (field) => (event) => {
        this.setState({
            touched: { ...this.state.touched, [field]: true }
        });
    }

    canBeSubmitted() {
        const { content ,images} = this.state;
        if(content.length===0&&images.length==0){
            return false
        }
        return true;
    }

    showModal=()=>{
        this.setState({isShowModal:true});
    }

    closeModal=()=>{
        this.setState({isShowModal:false})
    }

    validate = (content) => {
        return {
            content: content.length === 0,
        }
    }



    render() {
        const { content } = this.state;
        const errors = this.validate(content);
        const isEnabled = !Object.keys(errors).some(x => errors[x]);
        const displayButon = isEnabled ? '' : 'hidden';

        const imageClass = userService.getImageSize(this.props.loggedInUser.profilePicUrl);
        const loggedInUserProfilePicUrl = this.props.loggedInUser.profilePicUrl;
        const loggedInUserFirstName = this.props.loggedInUser.firstName;
        const loggedInUserLastName = this.props.loggedInUser.lastName;

        let formattedUsername = userService.formatUsername(loggedInUserFirstName)

        return (
            <Fragment>
                <section className="posts-section">
                    <div className="write-post" id="create-post-button-container">
                        <div className="post">
                            <div className="post-image">
                                <img className={imageClass} src={loggedInUserProfilePicUrl} alt="" />
                            </div>
                            <div className="post-area-container">
                                <div className="p-content" onClick={this.showModal}>
                                    {this.state.content.length===0?`Bạn đang nghĩ gì, ${formattedUsername}?`:this.state.content}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Modal  title={<h4 className="border-bottom" style={{ textAlign: "center" }}>Tạo bài viết</h4>}
                                open={this.state.isShowModal}
                               footer={[
                                   <Button disabled={!(this.state.content.length!==0||this.state.images.length!==0)}
                                           key="post" style={{width:"100%"}} onClick={this.onSubmitHandler} type="primary">
                                       Đăng
                                   </Button>]}
                               centered={true} onCancel={this.closeModal}
                        >
                                <div className="modal-post">
                                    <div className="d-flex align-items-lg-center pb-2">
                                        <div className="post-image d-inline-block m-2">
                                            <img className={imageClass} src={loggedInUserProfilePicUrl} alt="" />
                                        </div>
                                        <div className="d-inline font-weight-bold">
                                            {loggedInUserFirstName+" "+loggedInUserLastName}
                                        </div>
                                    </div>

                                    <TextArea
                                        name="content"
                                        id="content"
                                        value={this.state.content}
                                        onChange={this.onChangeHandler}
                                        placeholder={`Bạn đang nghĩ gì, ${formattedUsername}?`}
                                        autoSize={{ minRows: 3, maxRows: 6 }}
                                    />
                                </div>

                            <Dragger
                                data-testid="upload-dragger"
                                action="greeting"
                                multiple={true}
                                customRequest={({ file, onSuccess }) => {
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
                                <p className="ant-upload-drag-icon">
                                    <FileImageOutlined />
                                </p>
                                <p className="ant-upload-text">Thêm ảnh</p>
                                <p className="ant-upload-hint">
                                    hoặc kéo và thả tại đây
                                </p>
                            </Dragger>

                            <Modal open={this.state.previewOpen} title={this.state.previewTitle} footer={null} onCancel={this.handleCancel}>
                                <img
                                    alt="example"
                                    style={{
                                        width: '100%',
                                    }}
                                    src={this.state.previewImage}
                                />
                            </Modal>
                        </Modal>
                    </div>
                </section>
            </Fragment>
        )
    }
}
