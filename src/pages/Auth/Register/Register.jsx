import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLoaderData, useNavigate, useLocation } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Register = () => {
  const loaderData = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUser, updateUserProfile } = useAuth();
  const axiosSecure = useAxiosSecure();

  // Extract actual data from phpMyAdmin JSON
  const districts = loaderData.districts?.[2]?.data || [];
  const upazilas = loaderData.upazilas?.[2]?.data || [];

  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const filteredUpazilas = upazilas.filter(
    (u) => u.district_id === selectedDistrictId
  );

  const onSubmit = async (data) => {
    try {
      
      const result = await registerUser(data.email, data.password);
      const uid = result.user.uid;

      
      const formData = new FormData();
      formData.append("image", data.avatar[0]);

      const imgRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host_key}`,
        formData
      );

      const photoURL = imgRes.data.data.url;

      
      await updateUserProfile({
        displayName: data.name,
        photoURL,
      });

      // 4️⃣ Save user to database
      const userInfo = {
        uid,
        name: data.name,
        email: data.email,
        photoURL,
        bloodGroup: data.bloodGroup,
        district: data.district,
        upazila: data.upazila,
        role: "donor",
        status: "active",
      };

      await axiosSecure.post("/users", userInfo);

      
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Welcome to RedHope, your account has been created.",
        confirmButtonColor: "#D32F2F", 
      });
      console.log(userInfo);

      
      navigate(location.state?.from || "/");
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#D32F2F",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-base-100 shadow-2xl rounded-3xl p-10 my-12">
      <h2 className="text-4xl font-bold text-center mb-3 text-primary">Join RedHope</h2>
      <p className="text-center text-gray-500 mb-8">
        Save lives by becoming a donor today
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <input
          className="input input-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          placeholder="Full Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

        {/* Email */}
        <input
          className="input input-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          placeholder="Email"
          type="email"
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}

        {/* Avatar */}
        <input
          type="file"
          className="file-input file-input-bordered w-full border-primary focus:border-primary rounded-xl"
          {...register("avatar", { required: "Avatar is required" })}
        />
        {errors.avatar && <p className="text-red-500">{errors.avatar.message}</p>}

        {/* Blood Group */}
        <select
          className="select select-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          {...register("bloodGroup", { required: "Blood group is required" })}
        >
          <option value="">Select Blood Group</option>
          {bloodGroups.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>
        {errors.bloodGroup && (
          <p className="text-red-500">{errors.bloodGroup.message}</p>
        )}

        {/* District */}
        <select
          className="select select-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          {...register("district", { required: "District is required" })}
          onChange={(e) => setSelectedDistrictId(e.target.value)}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {errors.district && (
          <p className="text-red-500">{errors.district.message}</p>
        )}

        {/* Upazila */}
        <select
          className="select select-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          {...register("upazila", { required: "Upazila is required" })}
          disabled={!selectedDistrictId}
        >
          <option value="">Select Upazila</option>
          {filteredUpazilas.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
        {errors.upazila && (
          <p className="text-red-500">{errors.upazila.message}</p>
        )}

        {/* Password */}
        <input
          type="password"
          className="input input-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          placeholder="Password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
            pattern: {
              value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
              message:
                "Password must include uppercase, lowercase, number & special character",
            },
          })}
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}

        {/* Confirm Password */}
        <input
          type="password"
          className="input input-bordered w-full border-primary focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
          placeholder="Confirm Password"
          {...register("confirmPassword", {
            required: "Confirm password is required",
            validate: (value) =>
              value === getValues("password") || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}

        <button className="btn btn-primary w-full text-white mt-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
          Register
        </button>
      </form>

      <p className="text-center mt-4 text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-primary underline font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
