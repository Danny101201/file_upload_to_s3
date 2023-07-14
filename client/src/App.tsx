import { useEffect, useMemo, useState } from 'react'
import { ValidationSchema, validationSchema } from './validate/schema';
import { useForm, } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from 'axios'
function App() {
  const [avatar, setAvatar] = useState<string>()
  const [progress, setProgress] = useState<number>()
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    mode: 'onChange'
  });
  const onSubmit = async (data: ValidationSchema) => {
    try {

      if (!data.photo) return
      const formData = new FormData()
      formData.append('image', data.photo)
      formData.append('firstName', data.firstName)
      await axios.post('http://localhost:4000/upload/single', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return
          const progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(progress);
        },
        onDownloadProgress(progressEvent) {
          if (!progressEvent.total) return
          const progress = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(progress);
        },
      })
      alert('success upload image')
    } catch (e) { }

  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await register('photo').onChange(e)
    const file = e.target.files?.[0]
    if (!file || errors.photo) return
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = () => {
      if (!fileReader.result || errors.photo) return
      setAvatar(fileReader.result?.toString())
    }
  }
  const showProgressBar = isSubmitting && Object.keys(errors).length === 0
  return (
    <form className="px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4 md:flex md:justify-between">
        <div className="mb-4 md:mr-2 md:mb-0 flex-1">
          <label
            className="block mb-2 text-sm font-bold text-gray-700"
            htmlFor="firstName"
          >
            First Name
          </label>
          <input
            {...register('firstName')}
            className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded appearance-none focus:outline-none focus:shadow-outline"
            id="firstName"
            type="text"
            placeholder="First Name"
          />
          {errors.firstName && <p className='text-red-500'>{errors.firstName.message}</p>}
        </div>
        {!avatar ? (

          <div className="md:ml-2 flex-1">
            <label
              className="block mb-2 text-sm font-bold text-gray-700"
              htmlFor="photo"
            >
              photo
            </label>
            <input
              {...register('photo')}
              onChange={handleUploadImage}
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded appearance-none focus:outline-none focus:shadow-outline"
              id="photo"
              accept="image/*"
              type="file"
              placeholder="photo"
            />
            {errors.photo && <p className='text-red-500'>{errors.photo.message}</p>}
          </div>
        ) : (
          <div className='flex flex-col gap-[1rem]'>
            <div className='w-[100px] h-[100px] rounded-full overflow-hidden relative'>
              <img src={avatar} alt="" className='absolute inset-0 object-cover' />
            </div>
            <button
              className="w-full px-4 py-2 font-bold text-white bg-red-500 rounded-full hover:bg-red-700 focus:outline-none focus:shadow-outline"
              onClick={() => {
                setAvatar('')
                setValue('photo', null)
              }}
            >
              delete
            </button>
          </div>
        )}
      </div>
      <div className="mb-6 text-center">
        <button
          className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          type="submit"
        >
          upload
        </button>
      </div>
      {showProgressBar && (
        <>
          <div className='bg-green-500 h-3 ' style={{ width: progress + '%' }}></div>
          <span>{progress ? progress + '%' : '0%'} </span>
        </>
      )}
    </form>
  )
}

export default App
