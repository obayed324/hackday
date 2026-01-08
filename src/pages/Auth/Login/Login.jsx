import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../../../hooks/useAuth";
import Swal from "sweetalert2"; // ✅ Make sure to install sweetalert2: npm install sweetalert2

const Login = () => {
  const { signInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const from = location.state?.from?.pathname || "/"; // Redirect after login

  const onSubmit = async (data) => {
    try {
      await signInUser(data.email, data.password);

      // ✅ SweetAlert success
      Swal.fire({
        title: 'Login Successful!',
        text: `Welcome back!`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        timer: 1500,
        showConfirmButton: false,
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1600); // slightly longer than the alert timer
    } 
    catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Login Failed',
        text: 'Invalid email or password',
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-base-100 shadow-xl rounded-xl p-8 my-10 transition-transform transform hover:scale-105 duration-300">
      <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
      <p className="text-center text-gray-500 mb-6">
        Log in to your <span className="text-primary font-semibold">RedHope</span> account
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <input
          className="input input-bordered w-full transition-colors focus:border-primary focus:ring focus:ring-primary/20"
          placeholder="Email"
          type="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        {/* Password */}
        <input
          type="password"
          className="input input-bordered w-full transition-colors focus:border-primary focus:ring focus:ring-primary/20"
          placeholder="Password"
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}

        <button className="btn btn-primary w-full text-white mt-4 hover:scale-105 transition-transform duration-200">
          Login
        </button>
      </form>

      <p className="text-center mt-4">
        Don’t have an account?{" "}
        <Link to="/register" className="text-primary underline hover:text-primary-focus">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
