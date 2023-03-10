import React, {Component, Fragment} from 'react';
import '../../styles/FormPages.css'
import {toast} from 'react-toastify';
import TextField from '@mui/material/TextField';
import {ToastComponent} from '../common';
import placeholder_user_image from '../../assets/images/placeholder.png';
import default_background_image from '../../assets/images/default-background-image.jpg';
import {connect} from 'react-redux';
import {registerAction, redirectAction} from '../../store/actions/authActions'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import viLocale from 'date-fns/locale/vi';
import FormHelperText from '@mui/material/FormHelperText';
import {IconButton, InputAdornment, OutlinedInput} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import Button from "@mui/material/Button";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LogoBlameo from '../../assets/images/blameo_logo-no_bg.png'
import './css/register.css'
import {TabTitle} from "../../hocs/GeneralFunction";

class RegisterPage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            gender: '',
            birthday: new Date(),
            numberPhone: '',

            mess_firstName: '',
            mess_lastName: '',
            mess_gender: '',
            mess_birthday: '',
            mess_numberPhone: '',
            mess_email: '',
            mess_username: '',
            mess_password: '',
            mess_confirmPassword: '',
            mess_city: '',
            mess_address: '',

            showPassword: false,
            showPasswordConfirm: false,
            dialog: false,
            backdrop: false,


            profilePicUrl: placeholder_user_image,
            backgroundImageUrl: default_background_image,
            touched: {
                username: false,
                email: false,
                password: false,
                confirmPassword: false,
                firstName: false,
                lastName: false,
                address: false,
                city: false,
            }
        };

        this.onChangeHandler = this.onChangeHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }


    componentDidUpdate(prevProps, prevState) {

        if (this.props.registerError.hasError && prevProps.registerError !== this.props.registerError) {
            this.setState({backdrop: false})
            toast.error(<ToastComponent.errorToast text={this.props.registerError.message}/>, {
                position: toast.POSITION.TOP_RIGHT
            });
        } else if (this.props.registerSuccess) {
            this.props.redirect();

            this.setState({backdrop: false})
            this.setState({dialog: true})


        }
    }

    onChangeHandler(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
        console.log(event.target.name + ':' + event.target.value)
    }

    onSubmitHandler(event) {
        if (!this.canBeSubmitted()) {
            return;
        }
        this.setState({backdrop: true})
        const {touched, ...otherProps} = this.state;
        this.props.register(otherProps)
    }

    canBeSubmitted() {
        const {
            username,
            email,
            firstName,
            lastName,
            password,
            confirmPassword,
            address,
            city,
            gender,
            numberPhone
        } = this.state;
        const errors = this.validate(username, email, firstName, lastName, password, confirmPassword, address, city, gender, numberPhone);
        for (let errorsKey in errors) {
            if (errors[errorsKey] == true) {
                this.setState({['mess_' + errorsKey]: "Tr?????ng n??y kh??ng ???????c b??? tr???ng !"})
            } else {
                this.setState({['mess_' + errorsKey]: ""})
            }
        }

        let isDisabled = Object.keys(errors).some(x => errors[x])

        const phoneNumberRegex = new RegExp(
            '([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})'
        )
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        const passwordRegex = new RegExp(
            '^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[.,/;#?!@$%^&*-]).{8,}$'
        )

        if (!phoneNumberRegex.test(this.state.numberPhone)) {
            this.setState({mess_numberPhone: "S??? ??i???n tho???i kh??ng ????ng ?????nh d???ng!"});
            isDisabled = true;
        }

        if (!emailRegex.test(this.state.email)) {
            this.setState({mess_email: "email kh??ng ????ng ?????nh d???ng!"});
            isDisabled = true;
        }

        if (!passwordRegex.test(this.state.password)) {
            this.setState({mess_password: "Ph???i c?? ??t nh???t 8 k?? t???, trong ???? c?? ??t nh???t 1 ch??? c??i, 1 ch??? s??? v?? 1 k?? t??? ?????c bi???t!"});
            isDisabled = true;
        }

        if (this.state.password !== this.state.confirmPassword) {
            this.setState({mess_confirmPassword: "M???t kh???u nh???p l???i ph???i gi???ng v???i m???t kh???u ???? nh???p!"});
            isDisabled = true;
        }
        return !isDisabled;
    }


    validate = (username, email, firstName, lastName, password, confirmPassword, address, city, gender, numberPhone) => {
        return {
            gender: this.state.gender.length === 0,
            numberPhone: this.state.numberPhone.length === 0,
            username: username.length === 0,
            email: email.length === 0,
            firstName: firstName.length === 0,
            lastName: lastName.length === 0,
            password: password.length === 0,
            confirmPassword: confirmPassword.length === 0,
            address: address.length === 0,
            city: city.length === 0,

        }
    }

    handleChangePhoneNumber = (value) => {
        const phoneNumberRegex = new RegExp(
            '([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})'
        )
        this.setState({mess_numberPhone: ""})
        this.setState({numberPhone: value})
        if (value && !phoneNumberRegex.test(value)) {
            this.setState({mess_numberPhone: "S??? ??i???n tho???i kh??ng ????ng ?????nh d???ng!"})
        }
    }

    handleChangeEmail = (value) => {
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        this.setState({mess_email: ""})
        this.setState({email: value})
        if (value && !emailRegex.test(value)) {
            this.setState({mess_email: "Email kh??ng ????ng ?????nh d???ng!"})
        }
    }

    handleChangePassword = (event) => {
        const passwordRegex = new RegExp(
            '^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[.,/;#?!@$%^&*-]).{8,}$'
        )
        this.setState({mess_password: ""})
        this.setState({password: event.target.value})
        if (event.target.value && !passwordRegex.test(event.target.value)) {
            this.setState({mess_password: "Ph???i c?? ??t nh???t 8 k?? t???, trong ???? c?? ??t nh???t 1 ch??? c??i, 1 ch??? s??? v?? 1 k?? t??? ?????c bi???t!"})
        }
    };

    handleChangeConfirmPassword = (value) => {
        this.setState({mess_confirmPassword: ""})
        this.setState({confirmPassword: value})
        if (value && !(this.state.password === value)) {
            this.setState({mess_confirmPassword: "M???t kh???u nh???p l???i ph???i gi???ng v???i m???t kh???u ???? nh???p!"})
        }
    }

    handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    render() {
        TabTitle("Blameo | Register")
        const {username, email, firstName, lastName, password, confirmPassword, address, city} = this.state;
        const errors = this.validate(username, email, firstName, lastName, password, confirmPassword, address, city);
        const isEnabled = !Object.keys(errors).some(x => errors[x])

        const shouldMarkError = (field) => {
            const hasError = errors[field];
            const shouldShow = this.state.touched[field];
            return hasError ? shouldShow : false;
        }

        return (
            <Fragment>


                <div className="Register">
                    <div className="Register-container">
                        <div className="Register-container-header">
                            <div className="Register-container-header-title">
                                <h3>????ng k??</h3>
                                <p>T???o t??i kho???n m???ng x?? h???i Blameo ngay</p>
                            </div>
                            <img src={LogoBlameo}/>
                        </div>
                        <div className="Register-container-body">

                            <div className="row-2">
                                <TextField
                                    error={this.state.mess_firstName.length!==0}
                                    id="lastName"
                                    label="H??? v?? t??n ?????m"
                                    name="firstName"
                                    size="small"
                                    maxRows={1}
                                    value={this.state.firstName}
                                    helperText={this.state.mess_firstName}
                                    onChange={this.onChangeHandler}
                                />
                                <TextField
                                    error={this.state.mess_lastName.length!==0}
                                    id="firstName"
                                    label="T??n"
                                    name="lastName"
                                    size="small"
                                    maxRows={1}
                                    value={this.state.lastName}
                                    helperText={this.state.mess_lastName}
                                    onChange={this.onChangeHandler}
                                />
                            </div>

                            <div className="row-2">
                                <Box sx={{width: 222, height: 40}}>
                                    <FormControl fullWidth size="small" error={this.state.mess_gender.length!==0}>
                                        <InputLabel id="gender">Gi???i t??nh</InputLabel>
                                        <Select
                                            labelId="gender"
                                            id="gender-select"
                                            name="gender"
                                            value={this.state.gender}
                                            label="Gi???i t??nh"
                                            onChange={this.onChangeHandler}
                                        >
                                            <MenuItem value={'MALE'}>Nam</MenuItem>
                                            <MenuItem value={'FEMALE'}>N???</MenuItem>
                                            <MenuItem value={'UNKNOWN'}>Kh??c</MenuItem>
                                        </Select>
                                        <FormHelperText>{this.state.mess_gender}</FormHelperText>
                                    </FormControl>
                                </Box>
                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
                                    <DatePicker
                                        disableFuture
                                        openTo="year"
                                        views={['year', 'month', 'day']}
                                        label="Ng??y sinh"
                                        maxDate={new Date().setMonth(new Date().getMonth())}
                                        value={this.state.birthday}
                                        onChange={(newValue) => {
                                            this.setState({birthday: newValue});
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </div>

                            <div className="row-2">
                                <TextField
                                    error={this.state.mess_numberPhone.length!==0}
                                    id="phonenumber"
                                    label="S??? ??i???n tho???i"
                                    size="small"
                                    maxRows={1}
                                    value={this.state.numberPhone}
                                    helperText={this.state.mess_numberPhone}
                                    onChange={(e) => this.handleChangePhoneNumber(e.target.value)}
                                />
                                <TextField
                                    error={this.state.mess_email.length!==0}
                                    id="email"
                                    label="Email"
                                    size="small"
                                    maxRows={1}
                                    value={this.state.email}
                                    helperText={this.state.mess_email}
                                    onChange={(e) => this.handleChangeEmail(e.target.value)}
                                />
                            </div>

                            <div className="row-1">
                                <TextField
                                    error={this.state.mess_username.length!==0}
                                    id="username"
                                    label="T??n t??i kho???n"
                                    sx={{width: '100%', height: 20}}
                                    name="username"
                                    maxRows={1}
                                    value={this.state.username}
                                    helperText={this.state.mess_username}
                                    onChange={this.onChangeHandler}
                                />
                            </div>

                            <div className="row-1">
                                <TextField
                                    error={this.state.mess_address.length!==0}
                                    id="address"
                                    label="?????a ch???"
                                    sx={{width: '100%', height: 20}}
                                    name="address"
                                    maxRows={1}
                                    value={this.state.address}
                                    helperText={this.state.mess_address}
                                    onChange={this.onChangeHandler}
                                />
                            </div>

                            <div className="row-1">
                                <TextField
                                    error={this.state.mess_city.length!==0}
                                    id="city"
                                    label="T???nh/Th??nh ph???"
                                    sx={{width: '100%', height: 20}}
                                    name="city"
                                    maxRows={1}
                                    value={this.state.city}
                                    helperText={this.state.mess_city}
                                    onChange={this.onChangeHandler}
                                />
                            </div>

                            <div className="row-1">

                                <FormControl sx={{width: '100%'}} variant="outlined"
                                             error={this.state.mess_password.length!==0}

                                >
                                    <InputLabel htmlFor="password">M???t kh???u</InputLabel>
                                    <OutlinedInput
                                        id="password"
                                        type={this.state.showPassword ? 'text' : 'password'}
                                        value={this.state.password}
                                        onChange={this.handleChangePassword}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => this.setState({showPassword: !this.state.showPassword})}
                                                    onMouseDown={this.handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {this.state.showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Password"
                                    />
                                    <FormHelperText id="helper-text">{this.state.mess_password}</FormHelperText>
                                </FormControl>
                            </div>

                            <div className="row-1">

                                <FormControl sx={{width: '100%'}} variant="outlined"
                                             error={this.state.mess_confirmPassword.length!==0}
                                >

                                    <InputLabel htmlFor="confirm-password">Nh???p l???i m???t kh???u</InputLabel>
                                    <OutlinedInput

                                        id="confirm-password"
                                        type={this.state.showPasswordConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => this.handleChangeConfirmPassword(e.target.value)}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={() => this.setState({showPasswordConfirm: !this.state.showPasswordConfirm})}
                                                    onMouseDown={this.handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {this.state.showPasswordConfirm ? <VisibilityOff/> : <Visibility/>}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        label="Nh???p l???i m???t kh???u"
                                    />
                                    <FormHelperText id="helper-text">{this.state.mess_confirmPassword}</FormHelperText>
                                </FormControl>
                            </div>

                            <Button sx={{backgroundColor: '#52BDA1'}} color="success" variant="contained"
                                    onClick={this.onSubmitHandler}>T???o t??i kho???n</Button>
                            <div className="m-2">
                                <div className="fw-lg">B???n ???? c?? t??i kho???n ! <span className="lg-now"
                                                                                   onClick={() => this.props.history.push('/login')}>????ng nh???p ngay</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <Backdrop
                        sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                        open={this.state.backdrop}
                    >
                        <CircularProgress color="inherit"/>
                    </Backdrop>
                </div>
                <Dialog
                    open={this.state.dialog}
                    onClose={() => this.setState({dialog: false})}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title"
                                 sx={{backgroundColor: '#52BDA1', fontWeight: 'bold', color: 'white'}}>
                        {"T???o t??i kho???n th??nh c??ng !"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            <p className="dialog-message"> C???m ??n b???n ???? ????ng k?? t??i kho???n c???a Blameo !</p>
                            <p className="dialog-message">Gi??? ????y b???n c?? th??? s??? d???ng t??i kho???n n??y ????? ????ng nh???p v??o h???
                                th???ng c???a Blameo</p>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.props.history.push('/login')}>????ng nh???p ngay</Button>
                        <Button onClick={() => this.setState({dialog: false})}>OK</Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        )
    }
};

function mapStateToProps(state) {
    return {
        registerSuccess: state.register.success,
        registerMessage: state.register.message,
        registerError: state.registerError
    }
}

function mapDispatchToProps(dispatch) {
    return {
        register: (userData) =>
            dispatch(registerAction(userData)),
        redirect: () => dispatch(redirectAction())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterPage);
