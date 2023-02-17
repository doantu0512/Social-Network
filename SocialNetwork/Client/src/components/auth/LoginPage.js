import React, { Component } from 'react';
import '../../styles/FormPages.css';
import { connect } from 'react-redux';
import { loginAction, redirectAction } from '../../store/actions/authActions';
import Button from '@mui/material/Button';
import LogoBlameo from '../../assets/images/blameo_logo-no_bg.png'
import './css/login.css'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {TabTitle} from "../../hocs/GeneralFunction";
class FluidInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false,
            value: ""
        };
    }
    focusField() {
        const { focused } = this.state;
        this.setState({
            focused: !focused
        });
    }
    handleChange(event) {
        const { target } = event;
        const { value } = target;
        this.setState({
            value: value
        });
        console.log(value)
        this.props.onChange(value)
    }
    render() {
        const { type, label, style, id } = this.props;
        const { focused, value } = this.state;

        let inputClass = "fluid-input";
        if (focused) {
            inputClass += " fluid-input--focus";
        } else if (value != "") {
            inputClass += " fluid-input--open";
        }

        return (
            <div className={inputClass} style={style}>
                <div className="fluid-input-holder">

                    <input
                        className="fluid-input-input"
                        type={type}
                        id={id}
                        onFocus={this.focusField.bind(this)}
                        onBlur={this.focusField.bind(this)}
                        onChange={this.handleChange.bind(this)}
                        autoComplete="off"
                    />
                    <label className="fluid-input-label" forhtml={id}>{label}</label>

                </div>
            </div>
        );
    }
}

class Buttonlg extends React.Component {
    render() {
        return (
            <div className={`button ${this.props.buttonClass}`} onClick={this.props.onClick}>
                {this.props.buttonText}
            </div>
        );
    }
}


class LoginPage extends Component {



    constructor(props) {
        super(props)

        this.state = {
            username: '',
            password: '',
            message:'',
            backdrop:false,
            touched: {
                username: false,
                password: false
            }
        };

        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.loginError.hasError && prevProps.loginError !== this.props.loginError) {
            this.setState({backdrop:false})
            this.setState({message:"Sai tài khoản hoặc mật khẩu !"})
        } else if (this.props.loginSuccess) {
            this.props.redirect();

            this.setState({backdrop:false})

            this.props.history.push('/');
        }
    }

    onChangeHandler(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onSubmitHandler(event) {

        this.setState({message:''})
        if (!this.state.password && !this.state.username) {
            this.setState({message:"Vui lòng nhập tài khoản và mật khẩu ! "})
        }
        else if (!this.state.password) {
            this.setState({message:"Vui lòng nhập mật khẩu !"})
        }
        else if (!this.state.username) {
            this.setState({message:"Vui lòng nhập tài khoản !"})
        }
        else{
            this.setState({backdrop:true})
            const { username, password } = this.state;
            this.props.login(username, password);
        }
    }


    validate = (username, password) => {
        return {
            username: username.length === 0,
            password: password.length === 0
        }
    }

    style = {
        margin: "20px 0"
    };

    render() {

        TabTitle("Blameo | Login")
        const { username, password } = this.state;
        const errors = this.validate(username, password);
        const isEnabled = !Object.keys(errors).some(x => errors[x])

        const shouldMarkError = (field) => {
            const hasError = errors[field];
            const shouldShow = this.state.touched[field];

            return hasError ? shouldShow : false;
        }

        return (
            <section className="pt-3 mt-5 ctn">
                <div className="logo-blameo">
                    <img src={LogoBlameo}/>
                </div>
                <div className="login-container">
                    {/*<AccountCircleIcon sx={{ fontSize: 200, color: '#3fbe56' }} />*/}
                    <FluidInput type="text" label="Tài khoản" id="name" style={this.style} onChange={(e)=>this.setState({username: e})} value={this.state.username} />
                    <FluidInput type="password" label="Mật khẩu" id="password" style={this.style} onChange={(e)=>this.setState({password: e})} value={this.state.password} />
                    <p className={`message-login ${this.state.message ? "" : "padding-22"}`}>{this.state.message}</p>
                    <Buttonlg buttonText="Đăng nhập" buttonClass="login-button" onClick={this.onSubmitHandler} />
                    {/*<div className="forgotPassword" onClick={() => navigate("/forgot-password")}>Quên mật khẩu ?</div>*/}
                    <div className="signin"><Button variant="outlined" color="success" onClick={() => this.props.history.push('/register')}>Tạo tài khoản</Button> </div>
                    <div>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={this.state.backdrop}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </div>
                </div>
            </section>
        )
    }
};

function mapStateToProps(state, ownProps) {
    return {
        loginSuccess: state.login.success,
        loginError: state.loginError
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        login: (username, password) => dispatch(loginAction(username, password)),
        redirect: () => dispatch(redirectAction())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
