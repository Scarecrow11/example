import fileType from 'file-type'

interface Type {
  ext: string
  mime: string
}

export class FileType {
  private allowedImageMIME = ['image/png', 'image/jpeg', 'image/bmp']

  private type: Type
  constructor(public buffer: Buffer) {
    this.type = fileType(buffer) || { ext: '', mime: '' }
  }

  public isAllowedImageType(): boolean {
    return this.allowedImageMIME.includes(this.type.mime)
  }

  public getMimeType(): string {
    return this.type.mime
  }
}
