import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PropTypes } from "prop-types";
import { INPUT_LENGTH } from "../../../utils/constants";
import { nameValidation, emailValidation, passwordValidation } from "../../../utils/validation";
import "./modalChangeAccount.css"

/**
 * This component is a modal used to change sensitive account informatiom.
 * 
 * @visibleName Modal Change Account Info
 * @param {object} props
 * @param {string} props.action one of:'name', 'email', 'password.
 * @param {func} props.modalToggler opens/closes modal
 * @returns {React.ReactElement}
 */
function ModalChangeAccount(props) {
    const { action, modalToggler } = props;
    const actionLowerCase = action.toLowerCase()

    const user = useSelector((state) => state.user);

    let inputLengthMax = INPUT_LENGTH[actionLowerCase].maxValue;
    let inputLengthMin = INPUT_LENGTH[actionLowerCase].minValue;
    let inputType = actionLowerCase === "name" ? "text" : actionLowerCase;
    const inputAutoComplete = {
        name: "off",
        email: "email",
        password: "new-password",
    };

    const [formData, setFormData] = useState({
        inputField: "",
        confirmPassword: "", //used only if action is password: second input field value here
        isValid: false
    });

    const [formError, setFormError] = useState({
        occurred: true,
        show: false,
        message: "",
    });

    const formIsValid = !formError.occurred;

    const checkPwMatch = () => {
        if (formData.confirmPassword.length === 0) {
            return { response: false, message: "Please confirm password" }
        }
        let res;
        let pwMatch = (formData.inputField === formData.confirmPassword)
        pwMatch ?
            res = { response: true, message: "" } :
            res = { response: false, message: "Passwords do not match" }
        return res
    }

    const validateInput = (field) => {
        switch (actionLowerCase) {
            case "name":
                return nameValidation(formData.inputField)
            case "email":
                return emailValidation(formData.inputField)
            case "password":
                if (field === "confirmPassword") {
                    return checkPwMatch()
                } else {
                    return passwordValidation(formData.inputField)
                }
            default:
                return { response: false, message: "" }
        }
    }

    const validateForm = (showError, field = "inputField") => {
        let validity = validateInput(field);

        setFormError(() => ({
            occurred: validity.response,
            message: validity.message,
            show: showError
        }));

        if (actionLowerCase === "password") {
            let pwValid = passwordValidation(formData.inputField)
            let confirmPwisValid = checkPwMatch()
            let formIsValid = pwValid.response && confirmPwisValid.response

            setFormData((prevData) => ({
                ...prevData,
                isValid: formIsValid,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                isValid: validity.response,
            }));
        }
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if ((name === "confirmPassword" && value.length >= inputLengthMin) || (name !== "confirmPassword" && value.length > 3)) {
            validateForm(true, name) //show error
        } else {
            validateForm(false, name)//dont show error
        }
    };

    const handleBlur = (e) => {
        validateForm(true, e.target.name)
    };

    const checkIfDataChanged = () => {
        if (actionLowerCase === "password") { return true } //password data is not checked
        return user[actionLowerCase] !== formData.inputField;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        //===> TODO
        validateForm(true)
        let dataChanged = checkIfDataChanged()

        if (formData.isValid && dataChanged) {
            console.log('Form submitted:');
            const requestData = {
                action: actionLowerCase,
                newInput: formData.inputField
            }
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="ModalChangeAccount MAIN-form">
                {
                    actionLowerCase !== "name" && (
                        <>
                            <p>Note: two-step verification required.</p>
                            <br />
                        </>
                    )
                }
                {/* Hidden field for username: helps password managers associate info. (Avoids browser warning) */}

                {
                    actionLowerCase !== "email" && (
                        <div className="MAIN-display-none">
                            <label htmlFor="username">Username</label>
                            <input
                                autoComplete="username"
                                id="username"
                                name="username"
                                readOnly
                                type="text"
                                value={user.email}
                            />
                        </div>
                    )
                }

                {
                    actionLowerCase !== "password" &&
                    (<p >
                        Account {actionLowerCase}: {user[actionLowerCase]}
                    </p>)
                }

                <div className="MAIN-form-display-table">
                    <label htmlFor="inputField">New {actionLowerCase}:<span className="MAIN-form-star">*</span></label>
                    <input
                        aria-invalid={formError.occurred}
                        aria-describedby={`${actionLowerCase}-error`}
                        autoComplete={inputAutoComplete[actionLowerCase]}
                        id="inputField"
                        maxLength={inputLengthMax}
                        minLength={inputLengthMin}
                        name="inputField"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        required
                        type={inputType}
                        value={formData.inputField}
                    />
                </div>
                {
                    actionLowerCase === "password" && (
                        <div className="MAIN-form-display-table">
                            <label htmlFor="confirmPassword">Confirm password:<span className="MAIN-form-star">*</span></label>
                            <input
                                aria-invalid={formError.occurred}
                                aria-describedby="confirm-password-error"
                                autoComplete="new-password"
                                id="confirmPassword"
                                maxLength={inputLengthMax}
                                minLength={inputLengthMin}
                                name="confirmPassword"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                required
                                type="password"
                                value={formData.confirmPassword}
                            />
                        </div>
                    )
                }
                {
                    formError.message !== "" && formError.show && (
                        <p className="MAIN-error-message" id="error-message" aria-live="assertive">
                            <i>{formError.message}</i>
                        </p>
                    )
                }
                <br />

                <div className="ModalChangeAccount-BtnContainer">
                    <button disabled={!formData.isValid} type="submit" className="ModalChangeAccount-ActionBtn">Save</button>
                    <button onClick={modalToggler}>Cancel</button>
                </div>
            </form>
        </>
    );
};

ModalChangeAccount.propTypes = {
    action: PropTypes.oneOf(['name'.toLowerCase(), 'email'.toLowerCase(), 'password'.toLowerCase()]),
    modalToggler: PropTypes.func.isRequired
};

export default ModalChangeAccount;