import {
  Vk_AttachmentLoadOp,
  Vk_AttachmentStoreOp,
  Vk_ImageLayout,
} from '../../../dynamic-libs';
import { Color } from '../../../math';
import { AbstractRenderPass } from './AbstractRenderPass';

export class ClearScreenRenderPass extends AbstractRenderPass {
  #clearColor: Color = new Color(0, 0, 0, 1);

  constructor() {
    super();
  }

  get clearColor(): Color {
    return this.#clearColor;
  }

  set clearColor(color: Color) {
    this.#clearColor = color;
  }

  protected _defineAttachments(format: number): any[] {
    return [
      this._createColorAttachment({
        format,
        loadOp: Vk_AttachmentLoadOp.CLEAR,
        storeOp: Vk_AttachmentStoreOp.STORE,
        initialLayout: Vk_ImageLayout.UNDEFINED,
        finalLayout: Vk_ImageLayout.PRESENT_SRC_KHR,
      }),
    ];
  }

  protected _defineAttachmentReferences() {
    return {
      color: [
        this._createAttachmentRef(0, Vk_ImageLayout.COLOR_ATTACHMENT_OPTIMAL),
      ],
    };
  }

  protected _defineSubpasses(attachmentRefs: any) {
    return [
      this._createGraphicsSubpass({
        colorAttachments: attachmentRefs.color!,
      }),
    ];
  }

  protected _defineSubpassDependencies() {
    return null;
  }
}
