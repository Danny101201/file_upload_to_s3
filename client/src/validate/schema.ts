import { z } from "Zod";

export const validationSchema = z
  .object({
    firstName: z.string().min(1, { message: "firstName is required" }),
    photo: z
      .custom<FileList>()
      .transform(file => file.length && file.item(0))
      .refine((file) => !file || file.size <= 10 * 1204 * 1024, {
        message: '上傳上限是 10 mb'
      })
      .refine((file) => !file || file.type.startsWith("image"), {
        message: '只接受圖片上傳'
      })
  })
// extracting the type
export type ValidationSchema = z.infer<typeof validationSchema>;
