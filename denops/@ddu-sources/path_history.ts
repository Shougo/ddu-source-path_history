import {
  BaseSource,
  Context,
  Item,
  TreePath,
} from "https://deno.land/x/ddu_vim@v3.5.0/types.ts";
import { Denops, pathsep, vars } from "https://deno.land/x/ddu_vim@v3.5.0/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.5.3/file.ts";

function convertTreePath(treePath: TreePath) {
  return typeof treePath === "string" ? treePath : treePath.join(pathsep);
}

type Params = Record<string, never>;

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
            "ddu#get_context", uiName) as Context).pathHistories.map(
            (path) => convertTreePath(path));

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
