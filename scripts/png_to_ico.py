from PIL import Image
import os

def convert_to_ico():
    try:
        # 指定输入输出路径
        png_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'ico.png')
        build_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
        
        # 打开PNG图片并确保是RGBA模式
        img = Image.open(png_path)
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # 创建build目录
        if not os.path.exists(build_dir):
            os.makedirs(build_dir)
        
        # 调整为256x256
        resized = img.resize((256, 256), Image.Resampling.LANCZOS)
        
        # 保存为ICO文件
        ico_path = os.path.join(build_dir, 'icon.ico')
        resized.save(
            ico_path,
            format='ICO',
            sizes=[(256, 256)]
        )
        
        file_size = os.path.getsize(ico_path)
        print(f"ICO文件已保存: {ico_path}")
        print(f"文件大小: {file_size/1024:.2f} KB")
        
    except Exception as e:
        print(f"转换失败: {str(e)}")

if __name__ == "__main__":
    convert_to_ico()