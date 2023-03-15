import {
  BaseSource,
  Context,
  Item,
} from "https://deno.land/x/ddu_vim@v2.4.0/types.ts";
import { Denops, vars } from "https://deno.land/x/ddu_vim@v2.4.0/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.3.2/file.ts";

type Params = Record<never, never>;

export class Source extends BaseSource<Params> {
  override kind = "file";

  private uiName = "";

  override async onInit(args: {
    denops: Denops;
  }): Promise<void> {
    this.uiName = await vars.b.get(args.denops, "ddu_ui_name", "");
  }
  override gather(args: {
    denops: Denops;
    sourceParams: Params;
  }): ReadableStream<Item<ActionData>[]> {
    const uiName = this.uiName;
    return new ReadableStream({
      async start(controller) {
        if (uiName != "") {
          const pathHistories = (await args.denops.call(
            "ddu#get_context", uiName) as Context).pathHistories;

          controller.enqueue(pathHistories.map((h: string) => ({
            word: h,
            action: {
              path: h,
            },
          })));
        }

        controller.close();
      },
    });
  }

  override params(): Params {
    return {};
  }
}
