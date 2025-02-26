import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../css/register.css'

function Register() {

    const [username, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_WEB_URL}/api/users/signup`, {
                username,
                email,
                password,
            });

            if (response.data.success) {
                alert("Signup successful! Please log in.");
                navigate('/');   // Redirect to login page after successful signup
            } else {
                alert(response.data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };


    return (
        <div className='main-div'>
            <div className='form-div'>
                <h2>Register</h2>
                <line></line>
                <hr />
                <form onSubmit={handleSignup}>
                    <label className='reg-label'>Name</label><br />
                    <input className='name-in' type='text' value={username} onChange={(e) => setName(e.target.value)} required /><br />
                    <label className='reg-label' >Email</label><br />
                    <input className='email-in' type='text' value={email} onChange={(e) => setEmail(e.target.value)} required /><br />
                    <label className='reg-label'>Password</label><br />
                    <input className='password-in' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required /><br />
                    <button className='btn-reg' type='submit'>Register</button><br />
                    <label className='login-label' onClick={() => navigate('/')}>Already member? Login</label>
                </form>
            </div>
        </div>
    );
};

export default Register;