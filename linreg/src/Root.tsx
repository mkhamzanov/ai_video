import "./index.css";
import "./fonts-embed.css";
import "./katex-embed.css";
import "./lib/fonts";
import { Composition, Folder } from "remotion";
import { VIDEO } from "./template";
import { Example, TOTAL as EXAMPLE_TOTAL } from "./blocks/_example/Example";

const V = { fps: VIDEO.fps, width: VIDEO.width, height: VIDEO.height };

// Реестр композиций ДВИЖКА — только пример-заготовка `example`.
// Реальные ролики хранятся локально (вне git): их код лежит в blocks/*, а
// регистрация — в Root.local.tsx (тоже вне git). Чтобы работать со своими
// роликами локально, импортируй их здесь или веди Root.local.tsx. См. README.
export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Example">
      <Composition
        id="example"
        component={Example}
        durationInFrames={EXAMPLE_TOTAL}
        defaultProps={{ guide: false }}
        {...V}
      />
    </Folder>
  );
};
